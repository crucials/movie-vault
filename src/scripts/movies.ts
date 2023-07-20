import { Movie, MoviesFilters } from './types'
import { getDaysPassedCount, getHoursAndMinutes } from './utils'

const apiKey = import.meta.env.VITE_API_KEY
const API_BASE_URL = 'https://imdb-api.com/en/API'
const IMDB_BASE_URL = 'https://www.imdb.com/title'

type MovieArrayProxy = { value: Movie[] }


let movies : MovieArrayProxy

window.addEventListener('load', async () => {
    const moviesList = document.querySelector('.movies')
    const movieCardTemplate = document.querySelector('#movieCardTemplate') as HTMLTemplateElement

    movies = new Proxy({ value: [] }, {
        set(target, property, newValue) {
            target.value = newValue
            updateMoviesList()
            return true
        }
    })

    fillMoviesFromApi()

    function updateMoviesList() {
        if(moviesList) {

            moviesList.innerHTML = ''

            if(movies.value.length == 0) {
                document.querySelector('.no-results-text')?.classList.add('no-results-text-visible')
            }
            else {
                movies.value.forEach(movie => {                                                                                                                       
                    moviesList.insertAdjacentElement('beforeend', createMovieCardElement(movie))        
                })
            }
        }
    }

    function createMovieCardElement(movie : Movie) {
        const movieCard = movieCardTemplate.content.firstElementChild?.cloneNode(true) as HTMLLIElement

        const movieThumbnail = document.createElement('img')
        movieThumbnail.src = movie.posterUrl
        movieThumbnail.alt = movie.title
        movieThumbnail.classList.add('movie-thumbnail')
        movieCard.querySelector('header')?.insertAdjacentElement('afterbegin', movieThumbnail)

        const movieTitle = movieCard.querySelector('.movie-title') as HTMLAnchorElement
        movieTitle.insertAdjacentText('afterbegin', movie.title)
        movieTitle.href = movie.moreInfoPageUrl

        const movieRuntime = movieCard.querySelector('.movie-runtime') as HTMLTimeElement
        /*
            Omits 'mins' part from movie runtime string (for example, '156 mins' becomes '156') 
            and then converts it to number
        */
        if(movie.runtime) {
            const { hours, minutes } = getHoursAndMinutes(Number(movie.runtime.split(' ')[0]))
            movieRuntime?.insertAdjacentText('afterbegin', movie.runtime)
            movieRuntime.dateTime = `PT${hours}H${minutes}M`
        }
        else {
            movieRuntime.remove()
        }

        movie.genres.forEach(genre => {
            movieCard.querySelector('.genres-list')?.insertAdjacentHTML('beforeend', `
                        <li class="movie-genre">
                            ${genre}
                        </li>
                    `)
        })

        const watchButton = movieCard.querySelector('.watch-button') as HTMLAnchorElement
        watchButton.href = movie.moreInfoPageUrl

        return movieCard
    }
})

export async function fillMoviesFromApi(filters? : MoviesFilters) {
    const spinner = document.querySelector('.loading-indicator')

    if(!filters) {
        const cachedTrendingMovies = localStorage.getItem('trending-movies')
        const cacheDate = localStorage.getItem('cache-date')
        
        if(cachedTrendingMovies && cacheDate && getDaysPassedCount(new Date(cacheDate)) <= 4) {
            movies.value = JSON.parse(cachedTrendingMovies)
        }
        else {
            spinner?.classList.add('loading-indicator-visible')
            const trendingMoviesFromServer = await getTrendingMovies()

            localStorage.setItem('trending-movies', JSON.stringify(trendingMoviesFromServer))
            localStorage.setItem('cache-date', new Date().toString())

            spinner?.classList.remove('loading-indicator-visible')
            movies.value = trendingMoviesFromServer
        }
    }
    else {
        spinner?.classList.add('loading-indicator-visible')
        movies.value = await getFilteredMovies(filters)
        spinner?.classList.remove('loading-indicator-visible')
    }
}

async function getTrendingMovies() : Promise<Movie[]> {
    const response = await fetch('/data/trending-movies.json')

    if(response.ok) {
        const dataFromServer = await response.json()
        const trendingMovies = processSearchResults(dataFromServer)

        return trendingMovies
    }
    else {
        return []
    }
}

async function getFilteredMovies(filters : MoviesFilters) {
    const response = await fetch('/data/movies.json')

    if(!response.ok) {
        throw new Error()
    }

    const moviesFromJson = processSearchResults((await response.json()))
    return moviesFromJson.filter(movie => {
        const trimmedSearchQuery = filters.searchQuery.trim()

        if(trimmedSearchQuery.length > 0 
            && !movie.title.toUpperCase().includes(trimmedSearchQuery.toUpperCase())) {
            return false
        }

        if(filters.recent && movie.year !== new Date().getFullYear()) {
            return false
        }

        if(filters.goodRating && movie.rating < 8) {
            return false
        }

        if(filters.genres.length > 0 && !filters.genres.some(genre => movie.genres.includes(genre))) {
            return false
        }

        return true
    }).slice(0, 8)
}

function processSearchResults(results : any) : Movie[] {
    const processedResults = results.map((movieFromServer : any) => {
        return {
            title: movieFromServer.title,
            runtime: movieFromServer.runtimeStr,
            genres: movieFromServer.genres.split(', '),
            posterUrl: movieFromServer.image,
            moreInfoPageUrl: IMDB_BASE_URL + '/' + movieFromServer.id,
            year: +movieFromServer.year,
            rating: +movieFromServer.rating,
        }
    })

    return processedResults
}
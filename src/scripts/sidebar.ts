import { fillMoviesFromApi } from './movies'
import { MoviesFilters } from './types'

window.addEventListener('load', () => {
    const sidebar = document.querySelector('.sidebar')
    const errorText = document.querySelector('.error-text')

    const recentCheckbox = document.getElementById('recentCheckbox') as HTMLInputElement
    const goodRatingCheckbox = document.getElementById('goodRatingCheckbox') as HTMLInputElement
    const genresCheckboxes = document
        .querySelectorAll('.genre-filters-spoiler input[type="checkbox"]') as NodeListOf<HTMLInputElement>

    const searchQueryField = document.querySelector('.search-query-field') as HTMLInputElement

    document.querySelector('.expanded-content')?.addEventListener('submit', searchMovies)

    document.querySelector('.expand-button')?.addEventListener('click', openSidebar)
    document.querySelector('.open-sidebar-button')?.addEventListener('click', openSidebar)
    document.querySelector('.minimize-button')?.addEventListener('click', closeSidebar)

    function openSidebar() {
        sidebar?.classList.add('sidebar-expanded')
        sidebar?.classList.remove('sidebar-static')
    }
    function closeSidebar() {
        sidebar?.classList.remove('sidebar-expanded')
        setTimeout(() => {
            sidebar?.classList.add('sidebar-static')
        }, 400)
    }

    function searchMovies(event : Event) {
        event.preventDefault()
        const searchQuery = searchQueryField.value.trim()

        errorText?.classList.remove('error-text-visible')

        const filters : MoviesFilters = { 
            searchQuery, 
            genres: [], 
            recent: recentCheckbox.checked, 
            goodRating: goodRatingCheckbox.checked 
        }

        genresCheckboxes.forEach(checkbox => {
            if(checkbox.checked) {
                filters.genres.push(checkbox.value)
            }
        })

        sidebar?.classList.remove('sidebar-expanded')
        document.querySelector('.no-results-text')?.classList.remove('no-results-text-visible')
        fillMoviesFromApi(filters)
    }
})

let errorTextHideTimeoutId = 0
export function showErrorText() {
    const errorText = document.querySelector('.error-text')
    clearTimeout(errorTextHideTimeoutId)
    errorText?.classList.add('error-text-visible')
    
    errorTextHideTimeoutId = window.setTimeout(() => {
        errorText?.classList.remove('error-text-visible')
    }, 3000)
}
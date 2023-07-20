export type MoviesFilters = {
    searchQuery : string
    recent : boolean,
    goodRating : boolean,
    genres : string[]
}

export interface Movie {
    title : string,
    runtime : string
    genres : string[],
    posterUrl : string,
    moreInfoPageUrl : string,
    rating : number,
    year : number
}

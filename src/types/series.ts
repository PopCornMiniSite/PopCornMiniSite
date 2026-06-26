export interface Series {
  tmdb_id: number
  name: string
  overview: string
  poster_url: string
  backdrop_url: string
  vote_average: number
  genres: string[]
  number_of_seasons: number
  number_of_episodes: number
  first_air_date: string
  status: string
}

export interface Season {
  season_number: number
  name: string
  overview: string
  poster_url: string
  episode_count: number
  air_date: string
}

export interface Episode {
  id: number
  episode_number: number
  season_number: number
  name: string
  overview: string
  still_url: string
  runtime: number
  air_date: string
  series_id: number
}

export interface SeriesDetail extends Series {
  seasons: Season[]
}

export interface SeasonDetail {
  season_number: number
  name: string
  overview: string
  poster_url: string
  air_date: string
  episodes: Episode[]
}

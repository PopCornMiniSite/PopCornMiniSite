export interface Movie {
  tmdb_id: number
  title: string
  overview: string
  poster_url: string
  backdrop_url: string
  vote_average: number
  genres: string[]
  runtime: number
  release_date: string
  archive?: Archive
}

export interface Archive {
  random_name: string
  account1_stream_url?: string
  account2_stream_url?: string
  status: 'active' | 'reuploading' | 'deleted' | 'banned'
  file_size: number
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_url: string
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_url: string
}

export interface MovieCredits {
  cast: CastMember[]
  crew: CrewMember[]
}

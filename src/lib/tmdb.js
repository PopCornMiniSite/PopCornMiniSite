const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || 'b5d1cee6bf3e1271b0f6e6e6bbef3d28'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export const IMG_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/h632`,
  },
  logo: `${TMDB_IMAGE_BASE}/w500`,
}

export function getImageUrl(path, size = 'w342') {
  if (!path) return null
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

async function tmdbFetch(endpoint, params = {}) {
  const query = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', ...params })
  const res = await fetch(`${TMDB_BASE}${endpoint}?${query}`)
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export async function getTrending(timeWindow = 'week', page = 1) {
  return tmdbFetch(`/trending/all/${timeWindow}`, { page })
}

export async function getNowPlaying(page = 1) {
  return tmdbFetch('/movie/now_playing', { page })
}

export async function getTopRated(page = 1) {
  return tmdbFetch('/movie/top_rated', { page })
}

export async function getUpcoming(page = 1) {
  return tmdbFetch('/movie/upcoming', { page })
}

export async function getPopular(page = 1) {
  return tmdbFetch('/movie/popular', { page })
}

export async function getMovieDetails(id) {
  return tmdbFetch(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations' })
}

export async function getTvDetails(id) {
  return tmdbFetch(`/tv/${id}`, { append_to_response: 'credits,videos,recommendations' })
}

export async function getTvSeasonDetails(id, seasonNumber) {
  return tmdbFetch(`/tv/${id}/season/${seasonNumber}`)
}

export async function searchMulti(query, page = 1) {
  return tmdbFetch('/search/multi', { query, page })
}

export async function searchMovies(query, page = 1) {
  return tmdbFetch('/search/movie', { query, page })
}

export async function searchTv(query, page = 1) {
  return tmdbFetch('/search/tv', { query, page })
}

export async function getGenres(type = 'movie') {
  return tmdbFetch(`/genre/${type}/list`)
}

export async function discoverMovies(params = {}) {
  return tmdbFetch('/discover/movie', params)
}

export async function getMovieVideos(id) {
  return tmdbFetch(`/movie/${id}/videos`)
}

export async function getTvVideos(id) {
  return tmdbFetch(`/tv/${id}/videos`)
}

export async function getCredits(type, id) {
  return tmdbFetch(`/${type}/${id}/credits`)
}

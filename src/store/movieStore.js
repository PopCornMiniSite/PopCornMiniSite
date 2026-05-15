import { create } from 'zustand'
import * as tmdb from '../lib/tmdb'

const useMovieStore = create((set, get) => ({
  trending: [],
  nowPlaying: [],
  topRated: [],
  upcoming: [],
  popular: [],
  searchResults: [],
  genres: { movie: [], tv: [] },
  selectedCategory: 'trending',
  loading: false,
  searchLoading: false,
  error: null,

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  fetchTrending: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const data = await tmdb.getTrending('week', page)
      set({ trending: data.results, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchNowPlaying: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const data = await tmdb.getNowPlaying(page)
      set({ nowPlaying: data.results, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchTopRated: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const data = await tmdb.getTopRated(page)
      set({ topRated: data.results, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchUpcoming: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const data = await tmdb.getUpcoming(page)
      set({ upcoming: data.results, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchPopular: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const data = await tmdb.getPopular(page)
      set({ popular: data.results, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  searchContent: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], searchLoading: false })
      return
    }
    set({ searchLoading: true, error: null })
    try {
      const data = await tmdb.searchMulti(query)
      set({ searchResults: data.results, searchLoading: false })
    } catch (e) {
      set({ error: e.message, searchLoading: false })
    }
  },

  fetchGenres: async () => {
    try {
      const [movieGenres, tvGenres] = await Promise.all([
        tmdb.getGenres('movie'),
        tmdb.getGenres('tv'),
      ])
      set({ genres: { movie: movieGenres.genres, tv: tvGenres.genres } })
    } catch (e) {
      console.warn('Failed to fetch genres:', e)
    }
  },

  clearSearch: () => set({ searchResults: [] }),
}))

export default useMovieStore

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => ({
  user: null,
  tgUser: null,
  session: null,
  loading: true,
  favorites: [],
  watchHistory: [],

  setTgUser: (tgUser) => set({ tgUser }),

  setUser: (user) => set({ user }),

  setSession: (session) => set({ session }),

  setLoading: (loading) => set({ loading }),

  login: async (tgUser) => {
    set({ tgUser, loading: true })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          telegram_id: tgUser.id,
          username: tgUser.username || '',
          first_name: tgUser.firstName || '',
          last_name: tgUser.lastName || '',
          avatar_url: tgUser.photoUrl || '',
        }, { onConflict: 'telegram_id' })
        .select()
        .single()

      if (error) {
        set({ user: { id: tgUser.id, ...tgUser }, loading: false })
        return
      }

      set({ user: data, loading: false })
      await get().loadFavorites(data.id)
      await get().loadWatchHistory(data.id)
    } catch {
      set({ user: { id: tgUser.id, ...tgUser }, loading: false })
    }
  },

  logout: () => {
    set({ user: null, session: null, favorites: [], watchHistory: [] })
  },

  addFavorite: async (mediaItem) => {
    const user = get().user
    if (!user) return
    const item = {
      id: mediaItem.id,
      media_type: mediaItem.media_type || 'movie',
      title: mediaItem.title || mediaItem.name,
      poster_path: mediaItem.poster_path,
    }
    const { error } = await supabase.from('user_favorites').upsert({
      profile_id: user.id,
      tmdb_id: mediaItem.id,
      media_type: item.media_type,
      title: item.title,
      poster_url: mediaItem.poster_path,
    }, { onConflict: 'profile_id, tmdb_id, media_type' })
    if (!error) {
      set((state) => ({ favorites: [...state.favorites, item] }))
    }
  },

  removeFavorite: async (mediaId) => {
    const user = get().user
    if (!user) return
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .match({ profile_id: user.id, tmdb_id: mediaId })
    if (!error) {
      set((state) => ({
        favorites: state.favorites.filter((f) => f.id !== mediaId),
      }))
    }
  },

  isFavorite: (mediaId) => {
    return get().favorites.some((f) => f.id === mediaId)
  },

  loadFavorites: async (userId) => {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('profile_id', userId)
    if (!error && data) {
      set({
        favorites: data.map((f) => ({
          id: f.tmdb_id,
          media_type: f.media_type,
          title: f.title,
          poster_path: f.poster_url,
        })),
      })
    }
  },

  addToHistory: async (mediaItem) => {
    const user = get().user
    if (!user) return
    await supabase.from('watch_history').insert({
      profile_id: user.id,
      tmdb_id: mediaItem.id,
      media_type: mediaItem.media_type || 'movie',
      title: mediaItem.title || mediaItem.name,
      poster_url: mediaItem.poster_path,
    })
    set((state) => ({
      watchHistory: [
        { ...mediaItem, watched_at: new Date().toISOString() },
        ...state.watchHistory.slice(0, 49),
      ],
    }))
  },

  loadWatchHistory: async (userId) => {
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('profile_id', userId)
      .order('watched_at', { ascending: false })
      .limit(50)
    if (!error && data) {
      set({
        watchHistory: data.map((h) => ({
          id: h.tmdb_id,
          media_type: h.media_type,
          title: h.title,
          poster_path: h.poster_url,
          watched_at: h.watched_at,
        })),
      })
    }
  },
}))

export default useAuthStore

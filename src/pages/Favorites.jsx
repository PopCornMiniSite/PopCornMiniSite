import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import MovieCard from '../components/MovieCard'
import EmptyState from '../components/EmptyState'

export default function Favorites() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, favorites, loadFavorites, removeFavorite } = useAuthStore()
  const [tab, setTab] = useState('all')

  useEffect(() => {
    if (user) loadFavorites(user.id)
  }, [user, loadFavorites])

  const movies = favorites.filter((f) => f.media_type === 'movie' || !f.media_type)
  const tvShows = favorites.filter((f) => f.media_type === 'tv')

  const displayed = tab === 'movies' ? movies : tab === 'tv' ? tvShows : favorites

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold">{t('favorites.title')}</h1>
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'all' ? 'bg-primary text-white' : 'bg-surface text-muted'}`}
        >
          {t('search.all')}
        </button>
        <button
          onClick={() => setTab('movies')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'movies' ? 'bg-primary text-white' : 'bg-surface text-muted'}`}
        >
          {t('favorites.movies')}
        </button>
        <button
          onClick={() => setTab('tv')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'tv' ? 'bg-primary text-white' : 'bg-surface text-muted'}`}
        >
          {t('favorites.tvShows')}
        </button>
      </div>

      <div className="px-4">
        {displayed.length === 0 ? (
          <EmptyState
            message={t('favorites.empty')}
            action={
              <button onClick={() => navigate('/browse')} className="tg-btn text-sm mt-2">
                {t('browse.title')}
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayed.map((item) => (
              <div key={`${item.media_type}-${item.id}`} className="relative">
                <MovieCard item={item} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFavorite(item.id)
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

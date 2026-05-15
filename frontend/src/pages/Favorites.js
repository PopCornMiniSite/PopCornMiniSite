import React, { useEffect, useState } from 'react'
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
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('favorites.title')}</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '0 16px 16px' }}>
        <button
          onClick={() => setTab('all')}
          style={{
            padding: '8px 16px', borderRadius: '999px', fontSize: '14px',
            fontWeight: 500, border: 'none', cursor: 'pointer',
            backgroundColor: tab === 'all' ? '#E50914' : '#141428',
            color: tab === 'all' ? '#fff' : '#6B7280',
          }}
        >
          {t('search.all')}
        </button>
        <button
          onClick={() => setTab('movies')}
          style={{
            padding: '8px 16px', borderRadius: '999px', fontSize: '14px',
            fontWeight: 500, border: 'none', cursor: 'pointer',
            backgroundColor: tab === 'movies' ? '#E50914' : '#141428',
            color: tab === 'movies' ? '#fff' : '#6B7280',
          }}
        >
          {t('favorites.movies')}
        </button>
        <button
          onClick={() => setTab('tv')}
          style={{
            padding: '8px 16px', borderRadius: '999px', fontSize: '14px',
            fontWeight: 500, border: 'none', cursor: 'pointer',
            backgroundColor: tab === 'tv' ? '#E50914' : '#141428',
            color: tab === 'tv' ? '#fff' : '#6B7280',
          }}
        >
          {t('favorites.tvShows')}
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {displayed.length === 0 ? (
          <EmptyState
            message={t('favorites.empty')}
            action={
              <button onClick={() => navigate('/browse')} style={{
                backgroundColor: '#E50914', color: '#fff', fontWeight: 600,
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                fontSize: '14px', cursor: 'pointer', marginTop: '8px',
              }}>
                {t('browse.title')}
              </button>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {displayed.map((item) => (
              <div key={`${item.media_type}-${item.id}`} style={{ position: 'relative' }}>
                <MovieCard item={item} />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFavorite(item.id)
                  }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', zIndex: 10,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

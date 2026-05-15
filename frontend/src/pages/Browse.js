import React, { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useMovieStore from '../store/movieStore'
import MovieCard from '../components/MovieCard'
import GenrePills from '../components/GenrePills'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const CATEGORIES = [
  { key: 'trending', labelKey: 'trending' },
  { key: 'nowPlaying', labelKey: 'nowPlaying' },
  { key: 'topRated', labelKey: 'topRated' },
  { key: 'upcoming', labelKey: 'upcoming' },
  { key: 'popular', labelKey: 'popular' },
]

export default function Browse() {
  const { t } = useTranslation()
  const {
    trending, nowPlaying, topRated, upcoming, popular,
    genres, loading, selectedCategory, setSelectedCategory,
    fetchTrending, fetchNowPlaying, fetchTopRated, fetchUpcoming, fetchPopular, fetchGenres,
  } = useMovieStore()

  const [genreFilter, setGenreFilter] = useState(null)

  useEffect(() => {
    fetchTrending()
    fetchGenres()
  }, [fetchTrending, fetchGenres])

  const handleCategoryChange = useCallback((key) => {
    setSelectedCategory(key)
    setGenreFilter(null)
    switch (key) {
      case 'trending': fetchTrending(); break
      case 'nowPlaying': fetchNowPlaying(); break
      case 'topRated': fetchTopRated(); break
      case 'upcoming': fetchUpcoming(); break
      case 'popular': fetchPopular(); break
      default: fetchTrending()
    }
  }, [setSelectedCategory, fetchTrending, fetchNowPlaying, fetchTopRated, fetchUpcoming, fetchPopular])

  const items = {
    trending,
    nowPlaying,
    topRated,
    upcoming,
    popular,
  }[selectedCategory] || []

  const filtered = genreFilter
    ? items.filter((item) => item.genre_ids?.includes(genreFilter))
    : items

  const allGenres = [...(genres.movie || []), ...(genres.tv || [])]
  const uniqueGenres = allGenres.filter((g, i, a) => a.findIndex((x) => x.id === g.id) === i)

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('browse.title')}</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '0 16px 12px', scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            style={{
              whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: '999px',
              fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer',
              backgroundColor: selectedCategory === cat.key ? '#E50914' : '#141428',
              color: selectedCategory === cat.key ? '#fff' : '#6B7280',
              transition: 'background-color 0.2s, color 0.2s',
            }}
          >
            {t(`browse.${cat.labelKey}`)}
          </button>
        ))}
      </div>

      <GenrePills genres={uniqueGenres} selected={genreFilter} onSelect={setGenreFilter} />

      <div style={{ padding: '0 16px', marginTop: '16px' }}>
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : filtered.length === 0 ? (
          <EmptyState message={t('common.empty')} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {filtered.map((item) => (
              <MovieCard key={`${item.id}-${item.media_type || 'movie'}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useMovieStore from '../store/movieStore'
import MovieCard from '../components/MovieCard'
import GenrePills from '../components/GenrePills'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

const CATEGORIES = [
  { key: 'trending', apiKey: 'trending' },
  { key: 'nowPlaying', apiKey: 'nowPlaying' },
  { key: 'topRated', apiKey: 'topRated' },
  { key: 'upcoming', apiKey: 'upcoming' },
  { key: 'popular', apiKey: 'popular' },
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
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold">{t('browse.title')}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat.key
                ? 'bg-primary text-white'
                : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {t(`browse.${cat.key}`)}
          </button>
        ))}
      </div>

      <GenrePills
        genres={uniqueGenres}
        selected={genreFilter}
        onSelect={setGenreFilter}
      />

      <div className="px-4 mt-4">
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : filtered.length === 0 ? (
          <EmptyState message={t('common.empty')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <MovieCard key={`${item.id}-${item.media_type || 'movie'}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

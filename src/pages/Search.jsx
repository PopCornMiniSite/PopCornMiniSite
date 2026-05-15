import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useMovieStore from '../store/movieStore'
import SearchInput from '../components/SearchInput'
import MovieCard from '../components/MovieCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Search() {
  const { t } = useTranslation()
  const { searchResults, searchLoading, searchContent, clearSearch } = useMovieStore()
  const [query, setQuery] = useState('')

  const handleSearch = useCallback((val) => {
    setQuery(val)
    if (val.trim()) {
      searchContent(val)
    } else {
      clearSearch()
    }
  }, [searchContent, clearSearch])

  const movies = searchResults.filter((r) => r.media_type === 'movie')
  const tvShows = searchResults.filter((r) => r.media_type === 'tv')
  const people = searchResults.filter((r) => r.media_type === 'person')

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold mb-3">{t('search.title')}</h1>
        <SearchInput value={query} onChange={handleSearch} />
      </div>

      <div className="px-4">
        {searchLoading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : !query.trim() ? (
          <EmptyState
            icon={
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            }
            message={t('search.placeholder')}
          />
        ) : searchResults.length === 0 ? (
          <EmptyState message={t('search.noResults')} />
        ) : (
          <>
            {movies.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">{t('search.movies')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {movies.map((m) => (
                    <MovieCard key={m.id} item={m} mediaType="movie" />
                  ))}
                </div>
              </div>
            )}

            {tvShows.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">{t('search.tvShows')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tvShows.map((s) => (
                    <MovieCard key={s.id} item={s} mediaType="tv" />
                  ))}
                </div>
              </div>
            )}

            {people.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">People</h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                  {people.map((p) => (
                    <div key={p.id} className="flex-shrink-0 w-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-surface overflow-hidden mb-1">
                        {p.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${p.profile_path}`} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted line-clamp-1">{p.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

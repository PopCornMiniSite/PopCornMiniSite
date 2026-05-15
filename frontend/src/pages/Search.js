import React, { useState, useCallback } from 'react'
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
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>{t('search.title')}</h1>
        <SearchInput value={query} onChange={handleSearch} />
      </div>

      <div style={{ padding: '0 16px' }}>
        {searchLoading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : !query.trim() ? (
          <EmptyState
            icon={
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('search.movies')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {movies.map((m) => (
                    <MovieCard key={m.id} item={m} mediaType="movie" />
                  ))}
                </div>
              </div>
            )}

            {tvShows.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('search.tvShows')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {tvShows.map((s) => (
                    <MovieCard key={s.id} item={s} mediaType="tv" />
                  ))}
                </div>
              </div>
            )}

            {people.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>People</h2>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                  {people.map((p) => (
                    <div key={p.id} style={{ flexShrink: 0, width: '80px', textAlign: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#141428', overflow: 'hidden', marginBottom: '4px' }}>
                        {p.profile_path ? (
                          <img src={`https://image.tmdb.org/t/p/w185${p.profile_path}`} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(107,114,128,0.5)" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
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

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMovieDetails, getImageUrl } from '../lib/tmdb'
import { shareTelegram } from '../lib/telegram'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import MovieCard from '../components/MovieCard'

export default function MovieDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isFavorite, addFavorite, removeFavorite } = useAuthStore()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getMovieDetails(id)
      .then((data) => { setMovie(data); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [id])

  if (loading) return <LoadingSpinner size="lg" text={t('common.loading')} />
  if (error || !movie) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '24px' }}>
        <p style={{ color: '#6B7280', marginBottom: '16px' }}>{t('common.error')}</p>
        <button onClick={() => navigate(-1)} style={{ backgroundColor: '#E50914', color: '#fff', fontWeight: 600, padding: '12px 24px', borderRadius: '12px', border: 'none', fontSize: '14px', cursor: 'pointer' }}>{t('common.retry')}</button>
      </div>
    )
  }

  const backdrop = getImageUrl(movie.backdrop_path, 'w1280')
  const poster = getImageUrl(movie.poster_path, 'w500')
  const year = (movie.release_date || '').slice(0, 4)
  const runtime = movie.runtime ? `${movie.runtime} ${t('movie.minutes')}` : t('movie.notAvailable')
  const rating = movie.vote_average?.toFixed(1)
  const favorited = isFavorite(movie.id)

  const handleToggleFavorite = () => {
    if (favorited) removeFavorite(movie.id)
    else addFavorite({ ...movie, media_type: 'movie' })
  }

  const handleWatch = () => {
    navigate(`/watch/movie/${movie.id}`)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/movie/${movie.id}`
    shareTelegram(url, `Check out "${movie.title}" on PopCorn!`)
  }

  const handleParty = () => {
    navigate(`/party?media=movie:${movie.id}`)
  }

  const director = movie.credits?.crew?.find((c) => c.job === 'Director')
  const cast = movie.credits?.cast?.slice(0, 10) || []
  const recommendations = movie.recommendations?.results?.slice(0, 6) || []

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ position: 'relative', height: '45vh', minHeight: '300px' }}>
        {backdrop && (
          <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0A0A0A, rgba(10,10,10,0.6), transparent)' }} />

        <button onClick={() => navigate(-1)} style={{
          position: 'absolute', top: '16px', left: '16px', zIndex: 10,
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', zIndex: 10, display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ width: '96px', height: '144px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', backgroundColor: '#141428' }}>
            {poster && <img src={poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: 1.2 }}>{movie.title}</h1>
            {year && <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '2px' }}>{year}</p>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              {rating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#FFD700">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{rating}</span>
                </div>
              )}
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{runtime}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={handleWatch} style={{
            flex: 1, backgroundColor: '#E50914', color: '#fff', fontWeight: 600,
            padding: '12px 16px', borderRadius: '12px', border: 'none',
            fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {t('movie.watch')}
          </button>
          <button onClick={handleToggleFavorite} style={{
            width: '48px', height: '48px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: favorited ? 'rgba(255,215,0,0.2)' : '#141428',
            color: favorited ? '#FFD700' : '#6B7280',
            border: 'none', cursor: 'pointer', transition: 'background-color 0.2s',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button onClick={handleShare} style={{
            width: '48px', height: '48px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#141428', color: '#6B7280',
            border: 'none', cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={handleParty} style={{
            width: '48px', height: '48px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#141428', color: '#6B7280',
            border: 'none', cursor: 'pointer',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

        {movie.genres?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {movie.genres.map((g) => (
              <span key={g.id} style={{ padding: '4px 12px', backgroundColor: '#141428', borderRadius: '999px', fontSize: '12px', color: '#6B7280' }}>{g.name}</span>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('movie.overview')}</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>{movie.overview || t('movie.notAvailable')}</p>
        </div>

        {director && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{t('movie.director')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {director.profile_path ? (
                <img src={getImageUrl(director.profile_path, 'w185')} alt={director.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#141428', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{director.name}</span>
            </div>
          </div>
        )}

        {cast.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('movie.cast')}</h2>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
              {cast.map((actor) => (
                <div key={actor.id} style={{ flexShrink: 0, width: '80px', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#141428', overflow: 'hidden', marginBottom: '4px' }}>
                    {actor.profile_path ? (
                      <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(107,114,128,0.5)" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{actor.name}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(107,114,128,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('movie.recommendations')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {recommendations.map((rec) => (
                <MovieCard key={rec.id} item={rec} mediaType="movie" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

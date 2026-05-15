import { useEffect, useState } from 'react'
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <p className="text-muted mb-4">{t('common.error')}</p>
        <button onClick={() => navigate(-1)} className="tg-btn">{t('common.retry')}</button>
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
    if (favorited) {
      removeFavorite(movie.id)
    } else {
      addFavorite({ ...movie, media_type: 'movie' })
    }
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
    <div className="pb-24">
      <div className="relative h-[45vh] min-h-[300px]">
        {backdrop && (
          <img src={backdrop} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end gap-4">
          <div className="w-24 h-36 rounded-xl overflow-hidden flex-shrink-0 shadow-lg bg-surface">
            {poster && <img src={poster} alt={movie.title} className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{movie.title}</h1>
            {year && <p className="text-sm text-muted mt-0.5">{year}</p>}
            <div className="flex items-center gap-3 mt-2">
              {rating && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">{rating}</span>
                </div>
              )}
              <span className="text-sm text-muted">{runtime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <div className="flex gap-2 mb-4">
          <button onClick={handleWatch} className="tg-btn flex-1 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {t('movie.watch')}
          </button>
          <button onClick={handleToggleFavorite} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${favorited ? 'bg-accent/20 text-accent' : 'bg-surface text-muted'}`}>
            <svg className="w-6 h-6" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button onClick={handleShare} className="w-12 h-12 rounded-xl bg-surface text-muted flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button onClick={handleParty} className="w-12 h-12 rounded-xl bg-surface text-muted flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>

        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((g) => (
              <span key={g.id} className="px-3 py-1 bg-surface rounded-full text-xs text-muted">{g.name}</span>
            ))}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{t('movie.overview')}</h2>
          <p className="text-sm text-muted leading-relaxed">{movie.overview || t('movie.notAvailable')}</p>
        </div>

        {director && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">{t('movie.director')}</h2>
            <div className="flex items-center gap-3">
              {director.profile_path ? (
                <img src={getImageUrl(director.profile_path, 'w185')} alt={director.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className="text-sm font-medium">{director.name}</span>
            </div>
          </div>
        )}

        {cast.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('movie.cast')}</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {cast.map((actor) => (
                <div key={actor.id} className="flex-shrink-0 w-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-surface overflow-hidden mb-1">
                    {actor.profile_path ? (
                      <img src={getImageUrl(actor.profile_path, 'w185')} alt={actor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted line-clamp-1">{actor.name}</p>
                  <p className="text-[10px] text-muted/60 line-clamp-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">{t('movie.recommendations')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

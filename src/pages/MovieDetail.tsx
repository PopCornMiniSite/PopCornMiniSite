import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useMovie, useMovieCredits, useSimilarMovies, useStreamUrl, useCreateParty, useReportProgress } from '@/lib/api'
import { useUiStore } from '@/stores/uiStore'
import { useDirectionalAnimation } from '@/hooks/useDirectionalAnimation'
import { MovieCard } from '@/components/MovieCard'
import { ProgressBar } from '@/components/ProgressBar'
import { CommentsSection } from '@/components/CommentsSection'
import { PlyrVideoPlayer } from '@/components/PlyrVideoPlayer'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Clock, Play, Calendar, Users, X } from 'lucide-react'
import { formatVoteAverage } from '@/lib/format'

function CastCard({ name, character, profile_url }: { name: string; character: string; profile_url?: string | null }) {
  return (
    <div className="flex-shrink-0 w-24 text-center group">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-bg-tertiary mx-auto mb-1.5 border-2 border-border-subtle group-hover:border-brand-primary/40 transition-all duration-300">
        {profile_url ? (
          <img src={profile_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl text-text-tertiary">
            {name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-text-primary line-clamp-1 leading-tight">{name}</p>
      <p className="text-[10px] text-text-tertiary line-clamp-1 leading-tight mt-0.5">{character}</p>
    </div>
  )
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('movie')
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const { pageTransition: pageVariants } = useDirectionalAnimation()

  const movieId = Number(id)
  const { data: movie, isLoading, error } = useMovie(movieId)
  const { data: creditsData } = useMovieCredits(movieId)
  const { data: similarData } = useSimilarMovies(movieId)
  const createParty = useCreateParty()

  const [showPlayer, setShowPlayer] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  const { data: stream, isLoading: streamLoading, error: streamError } = useStreamUrl('movie', movieId)
  const reportProgress = useReportProgress()
  const lastPositionRef = useRef(0)
  const lastDurationRef = useRef(0)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (movie) {
      setPageTitle(movie.title)
    }
    return () => { setPageTitle('') }
  }, [movie, setPageTitle])

  useEffect(() => {
    if (!showPlayer) return
    progressIntervalRef.current = setInterval(() => {
      if (lastPositionRef.current > 0 && lastDurationRef.current > 0) {
        reportProgress.mutate({
          content_type: 'movie',
          content_id: movieId,
          position: lastPositionRef.current,
          duration: lastDurationRef.current,
          completed: false,
        })
      }
    }, 30000)
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [showPlayer, movieId, reportProgress])

  useEffect(() => {
    return () => {
      if (lastPositionRef.current > 0) {
        reportProgress.mutate({
          content_type: 'movie',
          content_id: movieId,
          position: lastPositionRef.current,
          duration: lastDurationRef.current,
          completed: false,
        })
      }
      const saved = JSON.parse(localStorage.getItem('continue_watching') ?? '[]') as Array<{
        id: number; type: string; position: number; duration: number
      }>
      const existing = saved.findIndex((s) => s.id === movieId && s.type === 'movie')
      const entry = { id: movieId, type: 'movie', position: lastPositionRef.current, duration: lastDurationRef.current }
      if (existing >= 0) saved[existing] = entry
      else saved.push(entry)
      localStorage.setItem('continue_watching', JSON.stringify(saved))
    }
  }, [movieId, reportProgress])

  useEffect(() => {
    if (showPlayer && playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showPlayer])

  const handleProgress = useCallback((position: number, duration: number) => {
    lastPositionRef.current = position
    lastDurationRef.current = duration
  }, [])

  const handleEnded = useCallback(() => {
    reportProgress.mutate({
      content_type: 'movie',
      content_id: movieId,
      position: lastPositionRef.current,
      duration: lastDurationRef.current,
      completed: true,
    })
  }, [movieId, reportProgress])

  if (isLoading) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="h-[300px] bg-bg-tertiary" />
        <div className="px-4 -mt-20 relative z-10">
          <div className="flex gap-4">
            <div className="w-[120px] h-[180px] rounded-xl bg-bg-secondary flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-16">
              <div className="h-6 w-3/4 bg-bg-tertiary rounded" />
              <div className="h-4 w-1/2 bg-bg-tertiary rounded" />
              <div className="h-3 w-1/3 bg-bg-tertiary rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-tertiary">{t('not_found', { defaultValue: 'الفيلم غير موجود' })}</p>
      </div>
    )
  }

  const cast = creditsData?.cast ?? []
  const similarMovies = similarData ?? []

  return (
    <motion.div className="min-h-screen" variants={pageVariants as any} initial="initial" animate="animate" exit="exit">
      {/* Backdrop hero */}
      <div className="relative h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary transition-colors cursor-pointer z-10"
          data-testid="movie-back-btn"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 -mt-24">
        <div className="flex gap-4">
          {/* Poster */}
          <div className="w-[130px] flex-shrink-0">
            <div className="rounded-xl overflow-hidden shadow-xl border border-border-subtle">
              <img src={movie.poster_url} alt={movie.title} className="w-full object-cover" loading="lazy" />
            </div>
            <ProgressBar progress={0} size="sm" showLabel className="mt-2" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-16">
            <h1 className="text-xl font-bold font-display text-text-primary leading-tight line-clamp-2">
              {movie.title}
            </h1>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-yellow-400/90 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {formatVoteAverage(movie.vote_average)}
              </div>
              <span className="w-px h-3 bg-border-subtle" />
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {movie.release_date?.split('-')[0]}
              </span>
              {movie.runtime > 0 && (
                <>
                  <span className="w-px h-3 bg-border-subtle" />
                  <span className="text-xs text-text-tertiary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {movie.runtime} دقيقة
                  </span>
                </>
              )}
            </div>

            {/* Genre tags */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {movie.genres.slice(0, 4).map((genre: string) => (
                <span key={genre} className="px-2 py-0.5 rounded-full bg-bg-tertiary text-[11px] text-text-secondary border border-border-subtle">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button size="lg" variant="primary" iconLeft={showPlayer ? <X className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            onClick={() => setShowPlayer((prev) => !prev)} data-testid="movie-watch-btn">
            {showPlayer ? 'إغلاق المشغل' : 'مشاهدة'}
          </Button>
          <Button size="lg" variant="outline" iconLeft={<Users className="w-4 h-4" />}
            onClick={async () => {
              try {
                const res = await createParty.mutateAsync({
                  title: movie.title,
                  media_type: 'movie',
                  media_id: movie.tmdb_id,
                  visibility: 'public',
                })
                navigate(`/party/${res.data.room_code}`)
              } catch {}
            }}
            data-testid="movie-party-btn">
            مع الأصدقاء
          </Button>
        </div>

        {/* Inline Player */}
        {showPlayer && (
          <div ref={playerRef} className="mt-4 rounded-xl overflow-hidden">
            {streamLoading ? (
              <Skeleton className="w-full aspect-video rounded-xl" />
            ) : streamError || !stream?.url ? (
              <div className="w-full aspect-video bg-bg-tertiary rounded-xl flex items-center justify-center px-4">
                <p className="text-sm text-text-tertiary text-center">
                  {t('player', 'Unable to load stream')}
                </p>
              </div>
            ) : (
              <PlyrVideoPlayer
                url={stream.url}
                title={movie.title}
                autoPlay
                onProgress={handleProgress}
                onEnded={handleEnded}
              />
            )}
          </div>
        )}

        {/* Overview */}
        <p className="text-sm text-text-secondary leading-relaxed mt-4">
          {movie.overview}
        </p>

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-6">
            <h3 className="text-base font-bold font-display text-text-primary mb-3">طاقم التمثيل</h3>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)' }}>
              {cast.slice(0, 15).map((member) => (
                <CastCard key={member.id} name={member.name} character={member.character} profile_url={member.profile_url} />
              ))}
            </div>
          </section>
        )}

        {/* Similar movies */}
        {similarMovies.length > 0 && (
          <section className="mt-8">
            <h3 className="text-base font-bold font-display text-text-primary mb-3">أعمال مشابهة</h3>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)' }}>
              {similarMovies.map((m: import('@/types/movie').Movie) => (
                <MovieCard key={m.tmdb_id} movie={m} />
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentsSection tmdbId={movie.tmdb_id} mediaType="movie" />

        {/* Bottom spacer for nav */}
        <div className="h-24" />
      </div>
    </motion.div>
  )
}
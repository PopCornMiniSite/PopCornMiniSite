import { useCallback, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStreamUrl, useMovie, useReportProgress } from '@/lib/api'
import { usePlayerStore } from '@/stores/playerStore'
import { useProgressReport } from '@/hooks/useProgressReport'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'

export default function WatchPage() {
  const { t } = useTranslation('player')
  const { type, id } = useParams<{ type: string; id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const contentType = type === 'episode' ? 'episode' : 'movie'
  const contentId = Number(id)
  const season = searchParams.get('season') ? Number(searchParams.get('season')) : undefined
  const episode = searchParams.get('ep') ? Number(searchParams.get('ep')) : undefined

  const { data: stream, isLoading: streamLoading, error: streamError } = useStreamUrl(
    contentType,
    contentId,
    season,
    episode,
  )

  const { data: movie } = useMovie(contentId)

  const { setStreamUrl, seek } = usePlayerStore()
  const { handleProgress: reportProgressHandler, lastPositionRef, lastDurationRef } = useProgressReport({
    contentType,
    contentId,
    season,
    episode,
  })

  useEffect(() => {
    if (stream?.url) {
      setStreamUrl(stream.url)
    }
    return () => {
      usePlayerStore.getState().pause()
    }
  }, [stream?.url, setStreamUrl])

  const handleProgress = useCallback(
    (position: number, duration: number) => {
      reportProgressHandler(position, duration)
      seek(position)
    },
    [seek, reportProgressHandler],
  )

  const reportProgress = useReportProgress()

  const handleEnded = useCallback(() => {
    reportProgress.mutate({
      content_type: contentType,
      content_id: contentId,
      season,
      episode,
      position: lastPositionRef.current,
      duration: lastDurationRef.current,
      completed: true,
    })
    if (contentType === 'movie') {
      navigate(`/movie/${contentId}`)
    } else {
      navigate(-1)
    }
  }, [contentType, contentId, season, episode, reportProgress, navigate, lastPositionRef, lastDurationRef])

  const handleBack = useCallback(() => {
    if (contentType === 'movie') {
      navigate(`/movie/${contentId}`)
    } else {
      navigate(-1)
    }
  }, [contentType, contentId, navigate])

  const isLoading = streamLoading
  const hasError = streamError

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Skeleton className="w-full aspect-video max-w-3xl" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-bg-primary" data-testid="watch-error">
        <p className="text-lg font-medium text-text-primary">
          {t('player', 'Unable to load stream')}
        </p>
        <button
          onClick={handleBack}
          className="px-6 py-2 rounded-lg text-sm font-medium cursor-pointer bg-brand-primary text-white hover:bg-brand-primary-hover shadow-[0_4px_16px_rgba(255,107,53,0.3)] transition-all duration-200"
          data-testid="watch-back-btn"
        >
          {t('player', 'Go Back')}
        </button>
      </div>
    )
  }

  const title = contentType === 'movie'
    ? movie?.title
    : searchParams.get('title') ?? `Episode ${episode ?? ''}`

  return (
    <div className="min-h-screen bg-bg-primary" data-testid="watch-page">
      <VideoPlayer
        url={stream?.url ?? ''}
        title={title ?? ''}
        type={contentType}
        contentId={contentId}
        season={season}
        episode={episode}
        autoPlay
        onProgress={handleProgress}
        onEnded={handleEnded}
        headerSlot={
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label={t('player', 'Back')}
            data-testid="watch-header-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        }
      />
    </div>
  )
}

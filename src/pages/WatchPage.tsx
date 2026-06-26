import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useStreamUrl, useReportProgress, useMovie } from '@/lib/api'
import { findVideoId, fetchManifest } from '@/lib/turso'
import { usePlayerStore } from '@/stores/playerStore'
import { VideoPlayer } from '@/components/VideoPlayer'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import type { ManifestData } from '@/lib/turso'

export default function WatchPage() {
  const { t } = useTranslation('player')
  const { type, id } = useParams<{ type: string; id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const contentType = type === 'episode' ? 'episode' : 'movie'
  const contentId = Number(id)
  const season = searchParams.get('season') ? Number(searchParams.get('season')) : undefined
  const episode = searchParams.get('ep') ? Number(searchParams.get('ep')) : undefined

  const [manifestData, setManifestData] = useState<ManifestData | null>(null)
  const [manifestLoading, setManifestLoading] = useState(true)
  const [manifestError, setManifestError] = useState<string | null>(null)

  const { data: stream, isLoading: streamLoading, error: streamError } = useStreamUrl(
    contentType,
    contentId,
    season,
    episode,
  )

  const { data: movie } = useMovie(contentId)
  const reportProgress = useReportProgress()

  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastPositionRef = useRef(0)
  const lastDurationRef = useRef(0)

  const { setStreamUrl, seek } = usePlayerStore()

  // Try to find video in Turso (new pipeline)
  useEffect(() => {
    let cancelled = false
    setManifestLoading(true)
    setManifestError(null)

    findVideoId(contentId, contentType, season, episode)
      .then(videoId => {
        if (cancelled) return
        if (!videoId) {
          setManifestLoading(false)
          return
        }
        return fetchManifest(videoId).then(m => {
          if (!cancelled) {
            setManifestData(m)
            setManifestLoading(false)
          }
        })
      })
      .catch(e => {
        if (!cancelled) {
          setManifestError(e instanceof Error ? e.message : String(e))
          setManifestLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [contentId, contentType, season, episode])

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
      lastPositionRef.current = position
      lastDurationRef.current = duration
      seek(position)
    },
    [seek],
  )

  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      if (lastPositionRef.current > 0 && lastDurationRef.current > 0) {
        reportProgress.mutate({
          content_type: contentType,
          content_id: contentId,
          season,
          episode,
          position: lastPositionRef.current,
          duration: lastDurationRef.current,
          completed: false,
        })
      }
    }, 30000)

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [contentType, contentId, season, episode, reportProgress])

  useEffect(() => {
    return () => {
      if (lastPositionRef.current > 0) {
        reportProgress.mutate({
          content_type: contentType,
          content_id: contentId,
          season,
          episode,
          position: lastPositionRef.current,
          duration: lastDurationRef.current,
          completed: false,
        })
      }
      const saved = JSON.parse(localStorage.getItem('continue_watching') ?? '[]') as Array<{
        id: number
        type: string
        position: number
        duration: number
      }>
      const existing = saved.findIndex((s) => s.id === contentId && s.type === contentType)
      const entry = {
        id: contentId,
        type: contentType,
        position: lastPositionRef.current,
        duration: lastDurationRef.current,
      }
      if (existing >= 0) {
        saved[existing] = entry
      } else {
        saved.push(entry)
      }
      localStorage.setItem('continue_watching', JSON.stringify(saved))
    }
  }, [contentType, contentId, season, episode, reportProgress])

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
  }, [contentType, contentId, season, episode, reportProgress, navigate])

  const handleBack = useCallback(() => {
    if (contentType === 'movie') {
      navigate(`/movie/${contentId}`)
    } else {
      navigate(-1)
    }
  }, [contentType, contentId, navigate])

  const isLoading = manifestLoading || streamLoading
  const hasError = manifestError || streamError

  if (isLoading && !manifestData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Skeleton className="w-full aspect-video max-w-3xl" />
      </div>
    )
  }

  if (hasError && !manifestData) {
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
        manifestData={manifestData ?? undefined}
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

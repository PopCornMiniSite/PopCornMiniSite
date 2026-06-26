import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useSeasonDetail } from '@/lib/api'
import { useDirectionalAnimation } from '@/hooks/useDirectionalAnimation'
import { formatDuration, formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Episode } from '@/types/series'
import { Play, ChevronLeft } from 'lucide-react'

function EpisodeRow({ episode, seriesId }: { episode: Episode; seriesId: number }) {
  const navigate = useNavigate()
  const { t } = useTranslation('movie')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors border border-transparent hover:border-border-subtle"
      data-testid={`episode-${episode.episode_number}`}
    >
      <div className="relative flex-shrink-0 w-[160px] h-[90px] rounded-lg overflow-hidden bg-bg-tertiary border border-border-subtle">
        {episode.still_url ? (
          <img
            src={episode.still_url}
            alt={episode.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-text-tertiary">
            E{episode.episode_number}
          </div>
        )}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium glass text-white">
          {formatDuration(episode.runtime)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1 text-text-primary">
          {episode.episode_number}. {episode.name}
        </p>
        {episode.air_date && (
          <p className="text-xs mt-0.5 text-text-tertiary">
            {formatDate(episode.air_date)}
          </p>
        )}
        <p className="text-xs mt-1 line-clamp-2 leading-relaxed text-text-tertiary">
          {episode.overview}
        </p>
        <Button
          size="sm"
          className="mt-2 h-7"
          iconLeft={<Play className="w-3 h-3" />}
          onClick={() =>
            navigate(
              `/watch/episode/${episode.id}?series=${seriesId}&season=${episode.season_number}&ep=${episode.episode_number}&title=${encodeURIComponent(episode.name)}`,
            )
          }
          data-testid={`episode-watch-${episode.episode_number}`}
        >
          {t('details', 'Watch')}
        </Button>
      </div>
    </motion.div>
  )
}

function SeasonDetailSkeleton() {
  return (
    <div data-testid="season-detail-skeleton">
      <Skeleton className="w-full h-[250px] rounded-none" />
      <div className="px-4 mt-4 space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3">
            <Skeleton className="w-[160px] h-[90px] rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SeasonDetail() {
  const { id, seasonNum } = useParams<{ id: string; seasonNum: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('movie')
  const { pageTransition } = useDirectionalAnimation()

  const seriesId = Number(id)
  const seasonNumber = Number(seasonNum)
  const { data: season, isLoading } = useSeasonDetail(seriesId, seasonNumber)

  const handleBack = useCallback(() => {
    navigate(`/series/${seriesId}`)
  }, [navigate, seriesId])

  if (isLoading) {
    return <SeasonDetailSkeleton />
  }

  if (!season) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-primary" data-testid="season-not-found">
        <p>{t('details', 'Season not found')}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      data-testid="season-detail"
    >
      {/* Poster / Header */}
      <div className="relative h-[250px]">
        {season.poster_url ? (
          <img
            src={season.poster_url}
            alt={season.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-bold bg-bg-tertiary text-text-tertiary">
            {t('seasons')} {seasonNumber}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer z-10 focus-visible:ring-2 focus-visible:ring-brand-primary"
          aria-label={t('details', 'Back')}
          data-testid="season-back-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 mt-3">
        <h1 className="text-xl font-bold font-display text-text-primary tracking-tight" data-testid="season-title">
          {season.name}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          {season.air_date && (
            <span className="text-sm text-text-tertiary">{formatDate(season.air_date)}</span>
          )}
          <span className="text-sm text-text-tertiary">
            {season.episodes.length} {t('episodes')}
          </span>
        </div>
        {season.overview && (
          <p className="mt-3 text-sm leading-relaxed text-text-secondary" data-testid="season-overview">
            {season.overview}
          </p>
        )}
      </div>

      {/* Episodes */}
      <div className="mt-4 px-4 pb-8" data-testid="episodes-list">
        <h2 className="text-lg font-semibold mb-3 font-display text-text-primary tracking-tight">
          {t('episodes')}
        </h2>
        <div className="space-y-2">
          {season.episodes.map((episode) => (
            <EpisodeRow key={episode.id} episode={episode} seriesId={seriesId} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

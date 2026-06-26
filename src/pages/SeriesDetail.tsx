import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useSeries, useSimilarMovies, useCreateParty } from '@/lib/api'
import { useUiStore } from '@/stores/uiStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useDirectionalAnimation } from '@/hooks/useDirectionalAnimation'
import { MovieCard } from '@/components/MovieCard'
import { ProgressBar } from '@/components/ProgressBar'
import { CommentsSection } from '@/components/CommentsSection'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, Play, Calendar, Users } from 'lucide-react'
import { formatVoteAverage } from '@/lib/format'
import type { Season } from '@/types/series'

function SeasonCard({ season, seriesId }: { season: Season; seriesId: number }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/series/${seriesId}/season/${season.season_number}`)}
      className="flex-shrink-0 w-36 text-left group cursor-pointer focus:outline-none"
    >
      <div className="w-36 h-52 rounded-xl overflow-hidden bg-bg-tertiary border border-border-subtle group-hover:border-brand-primary/30 transition-all duration-300">
        {season.poster_url ? (
          <img src={season.poster_url} alt={season.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-tertiary text-sm">{season.name}</div>
        )}
      </div>
      <p className="text-xs font-medium text-text-primary mt-1.5 line-clamp-1">{season.name}</p>
      <p className="text-[10px] text-text-tertiary">{season.episode_count} حلقة{season.air_date ? ` · ${season.air_date.split('-')[0]}` : ''}</p>
    </button>
  )
}

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('series')
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const setAtmosphere = useAtmosphereStore((s) => s.setAtmosphere)
  const { pageTransition: pageVariants } = useDirectionalAnimation()

  const seriesId = Number(id)
  const { data: series, isLoading, error } = useSeries(seriesId)
  const { data: similarData } = useSimilarMovies(seriesId)

  useEffect(() => {
    if (series) {
      setPageTitle(series.name)
      setAtmosphere(series.poster_url, series.backdrop_url)
    }
    return () => { setPageTitle('') }
  }, [series, setPageTitle, setAtmosphere])

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

  if (error || !series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-tertiary">{t('not_found', { defaultValue: 'المسلسل غير موجود' })}</p>
      </div>
    )
  }

  const seasons = series.seasons ?? []
  const similarSeries = similarData ?? []
  const createParty = useCreateParty()

  return (
    <motion.div className="min-h-screen" variants={pageVariants as any} initial="initial" animate="animate" exit="exit">
      {/* Backdrop hero */}
      <div className="relative h-[320px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${series.backdrop_url})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-transparent" />

        <button onClick={() => navigate(-1)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary transition-colors cursor-pointer z-10"
          data-testid="series-back-btn">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 px-4 -mt-24">
        <div className="flex gap-4">
          <div className="w-[130px] flex-shrink-0">
            <div className="rounded-xl overflow-hidden shadow-xl border border-border-subtle">
              <img src={series.poster_url} alt={series.name} className="w-full object-cover" loading="lazy" />
            </div>
            <ProgressBar progress={0} size="sm" showLabel className="mt-2" />
          </div>

          <div className="flex-1 min-w-0 pt-16">
            <h1 className="text-xl font-bold font-display text-text-primary leading-tight line-clamp-2">
              {series.name}
            </h1>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-yellow-400/90 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {formatVoteAverage(series.vote_average)}
              </div>
              <span className="w-px h-3 bg-border-subtle" />
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {series.first_air_date?.split('-')[0]}
              </span>
              <span className="w-px h-3 bg-border-subtle" />
              <span className="text-xs text-text-tertiary">{series.number_of_seasons} مواسم</span>
              <span className="w-px h-3 bg-border-subtle" />
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${series.status === 'Ended' ? 'bg-semantic-error/10 text-semantic-error' : 'bg-semantic-success/10 text-semantic-success'}`}>
                {series.status === 'Ended' ? 'منتهي' : 'مستمر'}
              </span>
            </div>

            {/* Genres */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {series.genres.slice(0, 4).map((genre: string) => (
                <span key={genre} className="px-2 py-0.5 rounded-full bg-bg-tertiary text-[11px] text-text-secondary border border-border-subtle">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button size="lg" variant="primary" iconLeft={<Play className="w-4 h-4" />}
            onClick={() => navigate(`/watch/episode/${series.tmdb_id}?season=1&episode=1`)}
            data-testid="series-watch-btn">
            مشاهدة
          </Button>
          <Button size="lg" variant="outline" iconLeft={<Users className="w-4 h-4" />}
            onClick={async () => {
              try {
                const res = await createParty.mutateAsync({
                  title: series.name,
                  media_type: 'series',
                  media_id: series.tmdb_id,
                  visibility: 'public',
                })
                navigate(`/party/${res.data.room_code}`)
              } catch {}
            }}
            data-testid="series-party-btn">
            مع الأصدقاء
          </Button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mt-4">
          {series.overview}
        </p>

        {/* Seasons */}
        {seasons.length > 0 && (
          <section className="mt-6">
            <h3 className="text-base font-bold font-display text-text-primary mb-3">المواسم</h3>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)' }}>
              {seasons.map((s) => (
                <SeasonCard key={s.season_number} season={s} seriesId={series.tmdb_id} />
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similarSeries.length > 0 && (
          <section className="mt-8">
            <h3 className="text-base font-bold font-display text-text-primary mb-3">مسلسلات مشابهة</h3>
            <div className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)' }}>
              {similarSeries.map((m: import('@/types/movie').Movie) => (
                <MovieCard key={m.tmdb_id} movie={m} />
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentsSection tmdbId={series.tmdb_id} mediaType="series" />

        <div className="h-24" />
      </div>
    </motion.div>
  )
}
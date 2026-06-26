import { useTranslation } from 'react-i18next'
import { useWatchHistory } from '@/lib/api'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { Film, Tv } from 'lucide-react'

export default function WatchHistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useWatchHistory()

  const items = data?.data ?? []

  return (
    <div className="p-4" data-testid="watch-history-page">
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-text-tertiary py-8">
          {t('profile:no_history')}
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-bg-tertiary border border-border-subtle p-3 cursor-pointer hover:bg-bg-hover transition-colors"
              onClick={() => {
                if (item.media_type === 'movie') {
                  navigate(`/watch/movie/${item.tmdb_id}`)
                } else if (item.media_type === 'series') {
                  if (item.season && item.episode) {
                    navigate(`/watch/episode/${item.tmdb_id}?season=${item.season}&episode=${item.episode}`)
                  } else {
                    navigate(`/series/${item.tmdb_id}`)
                  }
                }
              }}
              data-testid="history-item"
            >
              <div className="h-16 w-12 rounded-lg bg-bg-hover flex items-center justify-center border border-border-subtle">
                {item.media_type === 'movie'
                  ? <Film className="w-5 h-5 text-brand-primary" />
                  : <Tv className="w-5 h-5 text-brand-primary" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-text-primary">{item.title}</p>
                <p className="text-xs text-text-tertiary">
                  {item.season ? `S${item.season}E${item.episode}` : t('profile:movie')}
                </p>
                <Progress value={item.progress} className="h-1.5 mt-1" />
              </div>
              <span className="text-xs text-text-tertiary">{item.progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

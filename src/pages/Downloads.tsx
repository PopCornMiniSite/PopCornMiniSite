import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useWatchHistory } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Film, Tv, Play, DownloadCloud } from 'lucide-react'

export default function Downloads() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { data, isLoading } = useWatchHistory(1)

  const responseData = data as any
  const items = responseData?.data ?? responseData?.items ?? []

  return (
    <div data-testid="downloads-page">
      <Header />
      <motion.div
        className="p-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <DownloadCloud className="w-5 h-5 text-brand-primary" />
          <h1 className="text-xl font-bold font-display text-text-primary tracking-tight">
            {t('downloads')}
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-bg-tertiary border border-border-subtle flex items-center justify-center mb-4">
              <DownloadCloud className="w-8 h-8 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-tertiary">{t('no_downloads')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item: any, idx: number) => (
              <div
                key={item.id ?? idx}
                className="flex items-center gap-3 rounded-xl bg-bg-tertiary border border-border-subtle p-3 cursor-pointer hover:bg-bg-hover transition-all group"
                onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-bg-hover flex-shrink-0 border border-border-subtle">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.media_type === 'movie' ? <Film className="w-5 h-5 text-brand-primary" /> : <Tv className="w-5 h-5 text-brand-primary" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.title ?? item.name}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {item.progress ? `${Math.round(item.progress)}%` : ''}
                  </p>
                </div>
                <Play className="w-4 h-4 text-text-tertiary group-hover:text-brand-primary transition-colors" />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
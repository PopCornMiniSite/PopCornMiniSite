import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMyList, useRemoveFromList } from '@/lib/api'
import { Film, Tv, Trash2, ArrowRight } from 'lucide-react'
import { ProgressBar } from '@/components/ProgressBar'

export default function MyListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useMyList()
  const { mutate: remove } = useRemoveFromList()

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="p-4 min-h-screen" data-testid="my-list-page">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full glass text-text-secondary hover:text-brand-primary transition-colors cursor-pointer">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold font-display text-text-primary">
          {t('my_list', { defaultValue: 'قائمتي' })}
          {total > 0 && <span className="text-sm text-text-tertiary font-normal mr-2">({total})</span>}
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-40" />
          <p className="text-sm text-text-tertiary">{t('no_items', { defaultValue: 'قائمتك فارغة. أضف أفلاماً ومسلسلات لمشاهدتها لاحقاً!' })}</p>
          <button onClick={() => navigate('/discover')}
            className="mt-4 px-5 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-hover transition-colors cursor-pointer">
            {t('discover', { defaultValue: 'استكشف الأعمال' })}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id}
              className="flex items-center gap-3 rounded-xl bg-bg-tertiary border border-border-subtle p-3 cursor-pointer hover:bg-bg-hover transition-all group"
              onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
              data-testid="list-item"
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
                <p className="text-sm font-medium text-text-primary truncate">{item.title}</p>
                <p className="text-[11px] text-text-tertiary mt-0.5">
                  {item.media_type === 'movie' ? t('movie', { defaultValue: 'فيلم' }) : t('series', { defaultValue: 'مسلسل' })}
                </p>
                <ProgressBar progress={0} size="sm" className="mt-1.5" />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); remove({ tmdb_id: item.tmdb_id, media_type: item.media_type }) }}
                className="w-8 h-8 rounded-full glass flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                aria-label="Remove from list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
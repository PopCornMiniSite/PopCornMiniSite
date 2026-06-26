import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSearchQuery } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useLocalStorage'
import { Search, ArrowRight, Film, Tv } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export default function SearchResultsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const initialType = searchParams.get('type') ?? 'all'

  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState(initialType)
  const debouncedQuery = useDebounce(query, 300)

  const { data, isLoading } = useSearchQuery(debouncedQuery, type)

  useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (type !== 'all') params.set('type', type)
    setSearchParams(params, { replace: true })
  }, [debouncedQuery, type, setSearchParams])

  const items = data?.items ?? []
  const total = data?.total ?? 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const typeFilters: { key: string; label: string; icon?: LucideIcon }[] = [
    { key: 'all', label: t('search:all', { defaultValue: 'الكل' }) },
    { key: 'movie', label: t('search:movies', { defaultValue: 'أفلام' }), icon: Film },
    { key: 'series', label: t('search:series', { defaultValue: 'مسلسلات' }), icon: Tv },
  ]

  return (
    <div className="p-4 min-h-screen space-y-4" data-testid="search-page">
      <div className="flex items-center gap-2">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full glass text-text-secondary hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0">
          <ArrowRight className="w-4 h-4" />
        </button>
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discover:search_placeholder')}
            iconLeft={<Search className="w-4 h-4" />}
            data-testid="search-input"
          />
        </form>
      </div>

      <div className="flex gap-1.5">
        {typeFilters.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              type === key
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-bg-tertiary text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </button>
        ))}
      </div>

      {debouncedQuery && (
        <p className="text-xs text-text-tertiary">
          {t('search:results_for', { defaultValue: 'نتائج البحث عن' })}: &quot;{debouncedQuery}&quot;
          {total > 0 && <span> — {total} {t('search:result_count', { defaultValue: 'نتيجة' })}</span>}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : debouncedQuery && items.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-40" />
          <p className="text-sm text-text-tertiary">{t('discover:no_results')}</p>
          <p className="text-xs text-text-tertiary mt-1">{t('search:try_different', { defaultValue: 'جرب كلمات بحث مختلفة' })}</p>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item: any) => (
            <button
              key={`${item.media_type}-${item.tmdb_id}`}
              onClick={() => navigate(`/${item.media_type}/${item.tmdb_id}`)}
              className="rounded-xl overflow-hidden bg-bg-tertiary border border-border-subtle group hover:border-brand-primary/30 transition-all text-right cursor-pointer"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-hover">
                    {item.media_type === 'movie' ? <Film className="w-8 h-8 text-text-tertiary" /> : <Tv className="w-8 h-8 text-text-tertiary" />}
                  </div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white backdrop-blur-sm">
                  {item.media_type === 'movie' ? 'فيلم' : 'مسلسل'}
                </div>
                {item.vote_average && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-primary/80 text-white">
                    {item.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-text-primary line-clamp-1">{item.name}</p>
                {item.date && <p className="text-[10px] text-text-tertiary mt-0.5">{item.date.split('-')[0]}</p>}
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
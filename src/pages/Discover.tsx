import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { MovieCard } from '@/components/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMovies } from '@/lib/api'
import { Search, SlidersHorizontal, Film, Tv, Sparkles } from 'lucide-react'

type TabType = 'all' | 'movie' | 'series'

export default function Discover() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TabType>('all')

  const { data: movies, isLoading } = useMovies({ sort_by: 'popularity', per_page: 50 })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const items = movies?.items ?? []

  const tabs: { key: TabType; label: string; icon: typeof Film | typeof Tv | null }[] = [
    { key: 'all', label: t('search:all', { defaultValue: 'الكل' }), icon: null },
    { key: 'movie', label: t('search:movies', { defaultValue: 'أفلام' }), icon: Film },
    { key: 'series', label: t('search:series', { defaultValue: 'مسلسلات' }), icon: Tv },
  ]

  return (
    <div data-testid="discover-page">
      <Header />
      <motion.div
        className="p-4 space-y-6 pb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold font-display text-text-primary tracking-tight">
          {t('discover:title', { defaultValue: 'اكتشف' })}
        </h1>

        <form onSubmit={handleSearch}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discover:search_placeholder', { defaultValue: 'ابحث عن فيلم أو مسلسل...' })}
            iconLeft={<Search className="w-4 h-4" />}
            data-testid="discover-search"
          />
        </form>

        <div className="flex gap-1.5">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                tab === key
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-bg-tertiary text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary">
            <SlidersHorizontal className="w-4 h-4 inline ml-1 text-brand-primary" />
            {t('discover:filters', { defaultValue: 'تصفية حسب' })}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/search?type=movie')}>
              <Film className="w-3.5 h-3.5 ml-1" /> {t('discover:movies', { defaultValue: 'أفلام' })}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/search?type=series')}>
              <Tv className="w-3.5 h-3.5 ml-1" /> {t('discover:series', { defaultValue: 'مسلسلات' })}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-full">
                <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
                <Skeleton className="mt-1.5 h-3 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((movie: any) => (
                <MovieCard key={`${movie.tmdb_id}-${movie.id}`} movie={movie} />
              ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-tertiary">
            <p className="text-sm">{t('discover:no_results', { defaultValue: 'لا توجد نتائج' })}</p>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            {t('discover:quick_links', { defaultValue: 'روابط سريعة' })}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/history')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('discover:history', { defaultValue: 'سجل المشاهدة' })}</p>
            </button>
            <button onClick={() => navigate('/my-list')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('discover:my_list', { defaultValue: 'قائمتي' })}</p>
            </button>
            <button onClick={() => navigate('/store')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('discover:store', { defaultValue: 'المتجر' })}</p>
            </button>
            <button onClick={() => navigate('/leaderboard')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('discover:leaderboard', { defaultValue: 'المتصدرون' })}</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
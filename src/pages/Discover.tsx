import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, Film, Tv, Sparkles } from 'lucide-react'

export default function Discover() {
  const { t } = useTranslation('discover')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div data-testid="discover-page">
      <Header />
      <motion.div
        className="p-4 space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold font-display text-text-primary tracking-tight">
          {t('title')}
        </h1>

        <form onSubmit={handleSearch}>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            iconLeft={<Search className="w-4 h-4" />}
            data-testid="discover-search"
          />
        </form>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary">
            <SlidersHorizontal className="w-4 h-4 inline mr-1 text-brand-primary" />
            {t('filters', { defaultValue: 'تصفية حسب' })}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/search?type=movie')}>
              <Film className="w-3.5 h-3.5 ml-1" /> {t('movies', { defaultValue: 'أفلام' })}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/search?type=series')}>
              <Tv className="w-3.5 h-3.5 ml-1" /> {t('series', { defaultValue: 'مسلسلات' })}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            {t('quick_links', { defaultValue: 'روابط سريعة' })}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('/history')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('history', { defaultValue: 'سجل المشاهدة' })}</p>
            </button>
            <button onClick={() => navigate('/my-list')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('my_list', { defaultValue: 'قائمتي' })}</p>
            </button>
            <button onClick={() => navigate('/store')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('store', { defaultValue: 'المتجر' })}</p>
            </button>
            <button onClick={() => navigate('/leaderboard')}
              className="rounded-xl bg-bg-tertiary border border-border-subtle p-4 text-right hover:bg-bg-hover transition-colors cursor-pointer">
              <p className="text-xs text-text-tertiary">{t('leaderboard', { defaultValue: 'المتصدرون' })}</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
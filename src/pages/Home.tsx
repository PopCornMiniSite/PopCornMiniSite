import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { useNavigate } from 'react-router-dom'
import { fetchArchivedMovies, type ArchivedMovie } from '@/lib/turso'
import { useUiStore } from '@/stores/uiStore'

export default function Home() {
  const { t } = useTranslation('home')
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const navigate = useNavigate()
  const [archived, setArchived] = useState<ArchivedMovie[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPageTitle(t('welcome'))
  }, [setPageTitle, t])

  useEffect(() => {
    fetchArchivedMovies()
      .then((rows) => {
        setArchived(rows)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="relative" data-testid="home-page">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (archived.length === 0) {
    const dots = '.'.repeat((seconds % 3) + 1)
    return (
      <div className="relative" data-testid="home-page">
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
          <div className="text-6xl mb-4 opacity-30">🎬</div>
          <h2 className="text-xl font-bold font-display text-text-primary mb-2">
            {t('no_content_title', { defaultValue: 'No Content Yet' })}
          </h2>
          <p className="text-sm text-text-secondary max-w-xs leading-relaxed">
            {t('no_content_desc', {
              defaultValue: 'Archive a video using the bot to see it here.',
            })}
          </p>
          <div className="mt-8 text-xs text-text-tertiary font-mono tracking-widest">
            {t('waiting', { defaultValue: 'Waiting for archives' })}{dots}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" data-testid="home-page">
      <Header />
      <div className="relative z-[1] px-4 pt-3">
        <section className="mt-2">
          <h2 className="text-lg font-bold font-display text-text-primary tracking-tight mb-3">
            {t('archived', { defaultValue: 'Archived' })}
          </h2>
          <div
            className="flex flex-col gap-3"
          >
            {archived.map((item) => (
              <button
                key={item.random_name}
                onClick={() => navigate(`/watch/movie/${item.tmdb_id}`)}
                className="w-full text-left bg-[var(--tg-section-bg-color)] rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="text-text-primary font-medium truncate">
                  {item.title || item.original_filename}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {new Date(item.uploaded_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
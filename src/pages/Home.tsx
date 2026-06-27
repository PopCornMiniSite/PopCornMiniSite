import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { MovieCard } from '@/components/MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useUiStore } from '@/stores/uiStore'
import { useMovies } from '@/lib/api'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function ScrollRow({ title, movies, isLoading }: { title: string; movies: any[]; isLoading: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    const amount = 300
    rowRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-base font-bold font-display text-text-primary">{title}</h2>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => scroll('right')} className="w-7 h-7 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={rowRef} className="flex gap-3 overflow-x-auto px-4 pb-2 scroll-smooth no-scrollbar">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[150px]">
                <Skeleton className="w-[150px] h-[225px] rounded-xl" />
                <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
                <Skeleton className="mt-1.5 h-3 w-1/2 rounded-md" />
              </div>
            ))
          : movies.map((movie) => (
              <MovieCard key={`${movie.tmdb_id}-${movie.id}`} movie={movie} />
            ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { t } = useTranslation('home')
  const setPageTitle = useUiStore((s) => s.setPageTitle)

  const { data: latest, isLoading: latestLoading } = useMovies({ sort_by: 'release_date', per_page: 20 })
  const { data: trending, isLoading: trendingLoading } = useMovies({ sort_by: 'popularity', per_page: 20 })

  useEffect(() => {
    setPageTitle(t('welcome'))
  }, [setPageTitle, t])

  return (
    <div className="relative pb-8" data-testid="home-page">
      <Header />
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
        <h2 className="text-xl font-bold font-display text-text-primary mb-1">
          {t('welcome')}
        </h2>
        <p className="text-sm text-text-tertiary">{t('subtitle')}</p>
      </div>

      <div className="space-y-6">
        <ScrollRow
          title={t('latest')}
          movies={latest?.items ?? []}
          isLoading={latestLoading}
        />
        <ScrollRow
          title={t('trending')}
          movies={trending?.items ?? []}
          isLoading={trendingLoading}
        />
      </div>
    </div>
  )
}
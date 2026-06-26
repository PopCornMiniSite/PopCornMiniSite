import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { HeroBanner } from '@/components/HeroBanner'
import { MovieCard } from '@/components/MovieCard'
import { useMovies } from '@/lib/api'
import { useUiStore } from '@/stores/uiStore'
import { useAtmosphereStore } from '@/stores/atmosphereStore'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Movie } from '@/types/movie'

function MovieSection({ title, movies, isLoading, sectionIndex = 0 }: { title: string; movies: Movie[]; isLoading: boolean; sectionIndex?: number }) {
  const { t } = useTranslation('home')
  const navigate = useNavigate()

  return (
    <section className="mt-10 relative z-[1]">
      <div
        className="absolute -top-16 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 100% at ${sectionIndex % 2 === 0 ? '30%' : '70%'} 100%, rgba(255,107,53,0.03) 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
      />
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold font-display text-text-primary tracking-tight">
          {title}
        </h2>
        <button onClick={() => navigate('/discover')} className="flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer">
          {t('see_all', { defaultValue: 'See All' })}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div
        className="relative flex gap-3 overflow-x-auto px-4 pb-3"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          maskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 4%, black 94%, transparent 100%)',
        }}
      >
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <MovieCard key={i} movie={null!} isLoading />)
          : movies.map((movie) => (
              <MovieCard key={movie.tmdb_id} movie={movie} />
            ))}
      </div>
    </section>
  )
}

export default function Home() {
  const { t } = useTranslation('home')
  const setPageTitle = useUiStore((s) => s.setPageTitle)
  const setAtmosphere = useAtmosphereStore((s) => s.setAtmosphere)

  const { data: trendingData, isLoading: trendingLoading } = useMovies({ sort_by: 'popularity', per_page: 10 })
  const { data: latestData, isLoading: latestLoading } = useMovies({ sort_by: 'release_date', per_page: 10 })
  const { data: featuredData, isLoading: featuredLoading } = useMovies({ sort_by: 'vote_average', per_page: 10 })

  useEffect(() => {
    setPageTitle(t('welcome'))
  }, [setPageTitle, t])

  const trendingMovies = trendingData?.items ?? []
  const latestMovies = latestData?.items ?? []
  const featuredMovies = featuredData?.items ?? []

  const heroMovies = trendingMovies.slice(0, 5)

  const [heroIndex, setHeroIndex] = useState(0)

  const clampedIndex = heroIndex < heroMovies.length ? heroIndex : 0
  const currentMovie = heroMovies[clampedIndex]

  /* Sync current hero movie to the shared cinematic atmosphere */
  useEffect(() => {
    if (currentMovie) {
      setAtmosphere(currentMovie.poster_url, currentMovie.backdrop_url)
    }
  }, [currentMovie, setAtmosphere])

  const handleNext = useCallback(() => {
    if (heroMovies.length === 0) return
    setHeroIndex((prev) => (prev + 1) % heroMovies.length)
  }, [heroMovies.length])

  const handlePrev = useCallback(() => {
    if (heroMovies.length === 0) return
    setHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length)
  }, [heroMovies.length])

  const handleGoTo = useCallback((index: number) => {
    setHeroIndex(index)
  }, [])

  useEffect(() => {
    if (clampedIndex !== heroIndex) {
      setHeroIndex(clampedIndex)
    }
  }, [clampedIndex, heroIndex])

  return (
    <div className="relative" data-testid="home-page">
      <Header />

      <motion.div
        className="relative z-[1]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.42, 0, 0.18, 1] }}
      >
        <div className="px-4 pt-3">
          <HeroBanner
            movies={heroMovies}
            currentIndex={clampedIndex}
            onNext={handleNext}
            onPrev={handlePrev}
            onGoTo={handleGoTo}
          />
        </div>
        <MovieSection title={t('trending')} movies={trendingMovies} isLoading={trendingLoading} sectionIndex={0} />
        <MovieSection title={t('latest')} movies={latestMovies} isLoading={latestLoading} sectionIndex={1} />
        <MovieSection title={t('recommended')} movies={featuredMovies} isLoading={featuredLoading} sectionIndex={2} />
      </motion.div>
    </div>
  )
}
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, Star, Play, Info } from 'lucide-react'
import type { Movie } from '@/types/movie'
import { formatVoteAverage } from '@/lib/format'
import { Button } from '@/components/ui/button'

interface HeroBannerProps {
  movies: Movie[]
  currentIndex: number
  onNext: () => void
  onPrev: () => void
  onGoTo: (index: number) => void
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="particle" />
      ))}
    </div>
  )
}

export function HeroBanner({ movies, currentIndex, onNext, onPrev, onGoTo }: HeroBannerProps) {
  const navigate = useNavigate()
  const [direction, setDirection] = useState(1)

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1)
      onGoTo(index)
    },
    [currentIndex, onGoTo]
  )

  const next = useCallback(() => {
    if (movies.length === 0) return
    setDirection(1)
    onNext()
  }, [movies.length, onNext])

  const prev = useCallback(() => {
    if (movies.length === 0) return
    setDirection(-1)
    onPrev()
  }, [movies.length, onPrev])

  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(onNext, 6000)
    return () => clearInterval(timer)
  }, [movies.length, onNext])

  if (movies.length === 0) return null

  const movie = movies[currentIndex]
  if (!movie) return null

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      filter: 'blur(8px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      filter: 'blur(8px)',
    }),
  }

  return (
    <div className="relative w-full" data-testid="hero-banner">
      {/* ✦ Outer cinematic glow — volumetric light spilling from the card */}
      {/* Deep layer: wide, diffuse colour atmosphere from poster */}
      <div
        className="absolute pointer-events-none -inset-20 sm:-inset-24 lg:-inset-32 z-0"
        style={{
          backgroundImage: `url(${movie.poster_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(120px) saturate(3.5) brightness(1.2)',
          opacity: 0.2,
          transition: 'opacity 1.5s ease-in-out',
          maskImage: 'radial-gradient(ellipse at 50% 40%, black 25%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 25%, transparent 65%)',
        }}
      />
      {/* Mid layer: tighter vibrant colour punch from poster */}
      <div
        className="absolute pointer-events-none -inset-10 sm:-inset-14 lg:-inset-18 z-0"
        style={{
          backgroundImage: `url(${movie.poster_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(50px) saturate(4) brightness(1.3)',
          opacity: 0.25,
          transition: 'opacity 1s ease-in-out',
          maskImage: 'radial-gradient(ellipse at 50% 45%, black 15%, transparent 50%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, black 15%, transparent 50%)',
        }}
      />
      {/* Fill layer: broad backdrop scene softens the edges */}
      <div
        className="absolute pointer-events-none -inset-16 sm:-inset-20 lg:-inset-24 z-0"
        style={{
          backgroundImage: `url(${movie.backdrop_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(70px) saturate(2) brightness(0.9)',
          opacity: 0.15,
          transition: 'opacity 1.2s ease-in-out',
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 10%, transparent 55%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 10%, transparent 55%)',
        }}
      />
      {/* Subtle edge glow — box-shadow-like bleed at card border */}
      <div
        className="absolute pointer-events-none -inset-4 sm:-inset-6 z-0"
        style={{
          boxShadow: 'inset 0 0 60px rgba(255,107,53,0.08), 0 0 80px rgba(255,107,53,0.06)',
          borderRadius: '20px',
          transition: 'opacity 0.8s ease-in-out',
        }}
      />

      {/* Inner card — contains all visual layers */}
      <div className="relative h-[340px] sm:h-[440px] lg:h-[560px] overflow-hidden rounded-2xl">
        {/* Layer 1: Vibrant poster glow — deep colour wash with asymmetric breath */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
          style={{
            backgroundImage: `url(${movie.poster_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px) saturate(4) brightness(1.2)',
            transform: 'scale(2)',
            opacity: 0.7,
            animation: 'breath-slow 6s ease-in-out infinite',
            '--bo': '0.7',
          } as React.CSSProperties}
        />

        {/* Layer 2: Broader backdrop glow — fills the space */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none z-0"
          style={{
            backgroundImage: `url(${movie.backdrop_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(70px) saturate(2.5) brightness(0.9)',
            transform: 'scale(1.5)',
            opacity: 0.4,
            animation: 'breath-medium 8s ease-in-out infinite',
            '--bo': '0.4',
          } as React.CSSProperties}
        />

        {/* Layer 3: Radial colour accent from poster centre */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 60% at 50% 40%, rgba(255,255,255,0.08) 0%, transparent 70%),
              radial-gradient(ellipse 80% 50% at 50% 100%, rgba(10,10,15,0.3) 0%, transparent 70%)
            `,
          }}
        />

        {/* Layer 3b: Light leak — subtle coloured bleed from edges */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.04) 0%, transparent 30%, transparent 70%, rgba(0,212,170,0.03) 100%)',
            animation: 'light-leak 12s ease-in-out infinite',
          }}
        />

        {/* Layer 3c: Edge accent pulse — breathing rim light */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            borderRadius: '16px',
            animation: 'accent-pulse 5s ease-in-out infinite',
          }}
        />

        {/* Layer 3d: Screen emissive glow — makes the card feel self-illuminated like a screen */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 40% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 70%),
              radial-gradient(ellipse 50% 30% at 50% 30%, rgba(255,255,255,0.04) 0%, transparent 60%)
            `,
            animation: 'breath-fast 4.5s ease-in-out infinite',
            '--bo': '1',
            willChange: 'opacity',
          } as React.CSSProperties}
        />

        {/* Layer 3e: Subtle screen texture — ultra-fine dots for screen-like feel */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)`,
            backgroundSize: '3px 3px',
            opacity: 0.5,
          }}
        />

        {/* Layer 4: Floating particles */}
        <Particles />

        {/* Layer 5: Animated backdrop + content */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={movie.tmdb_id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-[4]"
        >
          {/* Backdrop image with subtle gradient overlays for readability */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${movie.backdrop_url})` }}
            role="img"
            aria-label={movie.title}
          />

          {/* Minimal dark gradients — just enough for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/25 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 lg:p-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="max-w-2xl space-y-3">
                {/* Minimal meta pill */}
                <motion.div
                  className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full glass text-[11px] font-medium text-white/60"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-primary" />
                  </span>
                  <span>الآن في PopCorn</span>
                </motion.div>

                {/* Title — significantly larger */}
                <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight font-display tracking-tight line-clamp-2">
                  {movie.title}
                </h2>

                {/* Metadata — smaller, more subtle */}
                <div className="flex items-center gap-2.5 text-white/50 text-xs sm:text-sm">
                  <span className="flex items-center gap-1 text-yellow-400/90 font-semibold text-xs">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {formatVoteAverage(movie.vote_average)}
                  </span>
                  <span className="w-px h-3 bg-white/10" />
                  <span>{movie.release_date?.split('-')[0]}</span>
                  {movie.genres.length > 0 && (
                    <>
                      <span className="w-px h-3 bg-white/10" />
                      <span>{movie.genres.slice(0, 2).join(' · ')}</span>
                    </>
                  )}
                  {movie.runtime > 0 && (
                    <>
                      <span className="w-px h-3 bg-white/10" />
                      <span>{movie.runtime} دقيقة</span>
                    </>
                  )}
                </div>

                {/* Overview — refined */}
                <p className="text-white/60 text-sm sm:text-base line-clamp-2 max-w-xl leading-relaxed">
                  {movie.overview}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <Button
                    size="lg"
                    variant="primary"
                    iconLeft={<Play className="w-4 h-4" />}
                    onClick={() => navigate(`/watch/movie/${movie.tmdb_id}`)}
                    data-testid="hero-watch-btn"
                  >
                    مشاهدة
                  </Button>
                  <Button
                    size="lg"
                    variant="glass"
                    iconLeft={<Info className="w-4 h-4" />}
                    onClick={() => navigate(`/movie/${movie.tmdb_id}`)}
                    data-testid="hero-details-btn"
                  >
                    التفاصيل
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows — always on top */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer z-10 focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Previous slide"
            data-testid="hero-prev-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer z-10 focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Next slide"
            data-testid="hero-next-btn"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10" role="tablist" aria-label="Slide indicators">
            {movies.map((m, i) => (
              <button
                key={m.tmdb_id}
                onClick={() => goTo(i)}
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                  i === currentIndex
                    ? 'bg-[#FF6B35] w-6 shadow-[0_0_8px_rgba(255,107,53,0.6)]'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                data-testid={`hero-dot-${i}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </div>
  )
}

export default HeroBanner
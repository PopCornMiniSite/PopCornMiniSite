import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { formatVoteAverage } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'
import type { Movie } from '@/types/movie'

interface MovieCardProps {
  movie: Movie
  isLoading?: boolean
}

export function MovieCard({ movie, isLoading }: MovieCardProps) {
  const navigate = useNavigate()

  const handlePress = useCallback(() => {
    if (movie) {
      navigate(`/movie/${movie.tmdb_id}`)
    }
  }, [navigate, movie])

  if (isLoading) {
    return (
      <div className="flex-shrink-0 w-[150px]" data-testid="movie-card-skeleton">
        <Skeleton className="w-[150px] h-[225px] rounded-xl" />
        <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-1/2 rounded-md" />
      </div>
    )
  }

  return (
    <div className="relative flex-shrink-0 w-[150px] group">
      {/* Ambient glow behind the card — lit by the cinematic atmosphere */}
      <div
        className="absolute -inset-4 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(255,107,53,0.1) 0%, rgba(0,212,170,0.03) 50%, transparent 70%)',
          filter: 'blur(18px)',
          animation: 'breath-fast 5s ease-in-out infinite',
          '--bo': '0.1',
          willChange: 'opacity, filter',
        } as React.CSSProperties}
      />

      <button
        className="relative w-full text-left cursor-pointer focus:outline-none z-[1]"
        onClick={handlePress}
        data-testid={`movie-card-${movie.tmdb_id}`}
        aria-label={`${movie.title} (${movie.release_date?.split('-')[0] ?? ''})`}
      >
        {/* Poster container */}
        <div
          className="relative w-[150px] h-[225px] rounded-xl overflow-hidden bg-bg-tertiary border border-border-subtle group-hover:border-brand-primary/30 transition-all duration-500"
          style={{
            boxShadow: [
              '0 0 24px rgba(255,107,53,0.06)',
              '0 0 48px rgba(255,107,53,0.02)',
            ].join(', '),
            transition: 'box-shadow 0.5s cubic-bezier(0.42, 0, 0.18, 1), border-color 0.3s ease',
          }}
        >
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overhead ambient light catch — reflection on the card surface */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Edge catch light — subtle top-edge highlight like rim lighting */}
          <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Rating badge — breathing glow */}
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-br from-[#FF6B35] to-[#E85D2E] text-white shadow-[0_2px_8px_rgba(255,107,53,0.35)]">
            <Star className="w-2.5 h-2.5 fill-white" />
            {formatVoteAverage(movie.vote_average)}
          </div>

          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Title + metadata */}
        <div className="mt-2.5 px-0.5">
          <p className="text-sm font-medium line-clamp-2 leading-snug font-display text-text-primary group-hover:text-brand-primary transition-colors duration-300">
            {movie.title}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[11px] text-text-tertiary">
              {movie.release_date?.split('-')[0] ?? ''}
            </span>
            {movie.genres.length > 0 && (
              <>
                <span className="w-px h-2.5 bg-border-subtle" />
                <span className="text-[11px] text-text-tertiary truncate">
                  {movie.genres[0]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title glow on hover — connects card text to the atmosphere */}
        <div
          className="absolute -bottom-2 left-0 right-0 h-8 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,53,0.06) 0%, transparent 70%)',
            filter: 'blur(12px)',
          }}
        />
      </button>
    </div>
  )
}

export default MovieCard
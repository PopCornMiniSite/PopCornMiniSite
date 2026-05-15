import { useNavigate } from 'react-router-dom'
import { getImageUrl } from '../lib/tmdb'

export default function MovieCard({ item, mediaType }) {
  const navigate = useNavigate()
  const type = mediaType || item.media_type || 'movie'
  const title = item.title || item.name || 'Untitled'
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null
  const year = (item.release_date || item.first_air_date || '').slice(0, 4)
  const poster = getImageUrl(item.poster_path, 'w342')

  const handleClick = () => {
    navigate(`/${type === 'tv' ? 'tv' : 'movie'}/${item.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="tg-card cursor-pointer group relative"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-surface">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {rating && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>
        )}

        {type === 'tv' && (
          <div className="absolute top-2 right-2 bg-primary rounded-md px-2 py-0.5">
            <span className="text-white text-[10px] font-bold uppercase">TV</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
          <button className="w-full tg-btn text-xs py-2">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch
          </button>
        </div>
      </div>

      <div className="p-2.5">
        <h3 className="text-sm font-medium line-clamp-1 text-white/90">{title}</h3>
        {year && <p className="text-xs text-muted mt-0.5">{year}</p>}
      </div>
    </div>
  )
}

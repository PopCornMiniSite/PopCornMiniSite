import React from 'react'
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
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ aspectRatio: '2/3', position: 'relative', overflow: 'hidden', backgroundColor: '#141428' }}>
        {poster ? (
          <img
            src={poster}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(107,114,128,0.5)" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {rating && (
          <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', borderRadius: '8px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 20 20" fill="#FFD700">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>{rating}</span>
          </div>
        )}

        {type === 'tv' && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#E50914', borderRadius: '6px', padding: '2px 8px' }}>
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>TV</span>
          </div>
        )}

        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          opacity: 0, transition: 'opacity 0.2s',
          display: 'flex', alignItems: 'flex-end', padding: '12px',
        }}
          className="card-hover-overlay"
        >
          <button style={{
            width: '100%', backgroundColor: '#E50914', color: '#fff',
            border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Watch
          </button>
        </div>
      </div>

      <div style={{ padding: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.9)', margin: 0 }}>{title}</h3>
        {year && <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0 0' }}>{year}</p>}
      </div>

      <style>{`
        .card-hover-overlay { opacity: 0; }
        div:hover > .card-hover-overlay { opacity: 1; }
      `}</style>
    </div>
  )
}

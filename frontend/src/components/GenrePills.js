import React, { useRef } from 'react'

export default function GenrePills({ genres = [], selected, onSelect }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' })
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => scroll(-1)}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10,
          width: '32px', background: 'linear-gradient(to right, #0A0A0A, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
          border: 'none', cursor: 'pointer', color: '#6B7280',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 32px', scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => onSelect(null)}
          style={{
            whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: '999px',
            fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer',
            backgroundColor: !selected ? '#E50914' : '#141428',
            color: !selected ? '#fff' : '#6B7280',
          }}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            style={{
              whiteSpace: 'nowrap', padding: '6px 16px', borderRadius: '999px',
              fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer',
              backgroundColor: selected === genre.id ? '#E50914' : '#141428',
              color: selected === genre.id ? '#fff' : '#6B7280',
            }}
          >
            {genre.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 10,
          width: '32px', background: 'linear-gradient(to left, #0A0A0A, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          border: 'none', cursor: 'pointer', color: '#6B7280',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

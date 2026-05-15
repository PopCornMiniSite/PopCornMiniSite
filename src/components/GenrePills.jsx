import { useRef } from 'react'

export default function GenrePills({ genres = [], selected, onSelect }) {
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 120, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent flex items-center justify-start"
      >
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2"
      >
        <button
          onClick={() => onSelect(null)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selected ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'
          }`}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => onSelect(genre.id)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === genre.id ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-white'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent flex items-center justify-end"
      >
        <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

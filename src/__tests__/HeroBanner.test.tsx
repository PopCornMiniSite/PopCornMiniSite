import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { HeroBanner } from '@/components/HeroBanner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Movie } from '@/types/movie'

const MOCK_MOVIES: Movie[] = [
  {
    tmdb_id: 1,
    title: 'Movie One',
    overview: 'First movie overview.',
    poster_url: 'https://example.com/poster1.jpg',
    backdrop_url: 'https://example.com/backdrop1.jpg',
    vote_average: 8.0,
    genres: ['Action'],
    runtime: 120,
    release_date: '2024-01-01',
  },
  {
    tmdb_id: 2,
    title: 'Movie Two',
    overview: 'Second movie overview.',
    poster_url: 'https://example.com/poster2.jpg',
    backdrop_url: 'https://example.com/backdrop2.jpg',
    vote_average: 7.5,
    genres: ['Comedy'],
    runtime: 90,
    release_date: '2024-06-15',
  },
]

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('HeroBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the first movie title', () => {
    render(<HeroBanner movies={MOCK_MOVIES} />, { wrapper: Wrapper })
    expect(screen.getByText('Movie One')).toBeDefined()
  })

  it('renders navigation buttons when multiple movies', () => {
    render(<HeroBanner movies={MOCK_MOVIES} />, { wrapper: Wrapper })
    expect(screen.getByTestId('hero-prev-btn')).toBeDefined()
    expect(screen.getByTestId('hero-next-btn')).toBeDefined()
  })

  it('renders dots for each movie', () => {
    render(<HeroBanner movies={MOCK_MOVIES} />, { wrapper: Wrapper })
    expect(screen.getByTestId('hero-dot-0')).toBeDefined()
    expect(screen.getByTestId('hero-dot-1')).toBeDefined()
  })

  it('renders watch and details buttons', () => {
    render(<HeroBanner movies={MOCK_MOVIES} />, { wrapper: Wrapper })
    expect(screen.getByTestId('hero-watch-btn')).toBeDefined()
    expect(screen.getByTestId('hero-details-btn')).toBeDefined()
  })

  it('renders nothing when no movies', () => {
    const { container } = render(<HeroBanner movies={[]} />, { wrapper: Wrapper })
    expect(container.querySelector('[data-testid="hero-banner"]')).toBeNull()
  })

  it('navigates forward when next button clicked', async () => {
    render(<HeroBanner movies={MOCK_MOVIES} />, { wrapper: Wrapper })

    expect(screen.getByTestId('hero-dot-0').getAttribute('class')).toContain('bg-[#FF6B35]')

    await act(async () => {
      vi.useRealTimers()
      const nextBtn = screen.getByTestId('hero-next-btn')
      nextBtn.click()
      vi.useFakeTimers()
    })

    expect(screen.getByTestId('hero-dot-1').getAttribute('class')).toContain('bg-[#FF6B35]')
  })
})

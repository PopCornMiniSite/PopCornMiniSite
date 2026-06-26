import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MovieCard } from '@/components/MovieCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { Movie } from '@/types/movie'

const MOCK_MOVIE: Movie = {
  tmdb_id: 550988,
  title: 'Free Guy',
  overview: 'A bank teller discovers he is actually a background character.',
  poster_url: 'https://image.tmdb.org/t/p/w342/8Y43SOcDlFwQ6C0U11NZCt01Cdf.jpg',
  backdrop_url: 'https://image.tmdb.org/t/p/w780/8Y43SOcDlFwQ6C0U11NZCt01Cdf.jpg',
  vote_average: 7.7,
  genres: ['Action', 'Comedy'],
  runtime: 115,
  release_date: '2021-08-11',
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('MovieCard', () => {
  it('renders movie title and year', () => {
    render(<MovieCard movie={MOCK_MOVIE} />, { wrapper: Wrapper })

    expect(screen.getByText('Free Guy')).toBeDefined()
    expect(screen.getByText('2021')).toBeDefined()
  })

  it('renders rating badge', () => {
    render(<MovieCard movie={MOCK_MOVIE} />, { wrapper: Wrapper })

    expect(screen.getByText('7.7')).toBeDefined()
  })

  it('renders genre pills', () => {
    render(<MovieCard movie={MOCK_MOVIE} />, { wrapper: Wrapper })

    expect(screen.getByText('Action')).toBeDefined()
    expect(screen.getByText('Comedy')).toBeDefined()
  })

  it('renders poster image', () => {
    render(<MovieCard movie={MOCK_MOVIE} />, { wrapper: Wrapper })

    const img = screen.getByRole('img', { name: /free guy/i })
    expect(img).toBeDefined()
    expect(img.getAttribute('src')).toContain('w342')
  })

  it('shows skeleton when isLoading', () => {
    render(<MovieCard movie={null!} isLoading />, { wrapper: Wrapper })

    expect(screen.getByTestId('movie-card-skeleton')).toBeDefined()
  })

  it('has correct data-testid', () => {
    render(<MovieCard movie={MOCK_MOVIE} />, { wrapper: Wrapper })

    expect(screen.getByTestId('movie-card-550988')).toBeDefined()
  })
})

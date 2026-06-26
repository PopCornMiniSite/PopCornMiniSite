import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import MovieDetail from '@/pages/MovieDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

function createWrapper(initialEntries = ['/movie/550988']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/movie/:id" element={children} />
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('MovieDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders movie title after loading', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('movie-detail')).toBeDefined()
    })

    expect(screen.getByTestId('movie-title').textContent).toContain('Free Guy')
  })

  it('renders movie overview', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('movie-overview')).toBeDefined()
    })

    expect(screen.getByTestId('movie-overview').textContent).toContain('bank teller')
  })

  it('renders watch button', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('movie-watch-btn')).toBeDefined()
      expect(screen.getByTestId('movie-watch-btn').textContent).toContain('Watch')
    })
  })

  it('renders back button', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('movie-back-btn')).toBeDefined()
    })
  })

  it('renders cast section', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('cast-section')).toBeDefined()
    })
  })

  it('renders similar section', async () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('similar-section')).toBeDefined()
    })
  })

  it('renders not found for invalid movie', async () => {
    server.use(
      http.get('/api/v1/movies/:id', () => {
        return HttpResponse.json(
          { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
          { status: 404 },
        )
      }),
    )

    render(<MovieDetail />, { wrapper: createWrapper(['/movie/99999']) })

    await waitFor(() => {
      expect(screen.getByTestId('movie-not-found')).toBeDefined()
    })
  })

  it('renders skeleton during loading', () => {
    render(<MovieDetail />, { wrapper: createWrapper() })

    expect(screen.getByTestId('movie-detail-skeleton')).toBeDefined()
  })
})

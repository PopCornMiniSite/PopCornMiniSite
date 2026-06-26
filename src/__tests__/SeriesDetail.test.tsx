import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SeriesDetail from '@/pages/SeriesDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

function createWrapper(initialEntries = ['/series/1396']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/series/:id" element={children} />
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('SeriesDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders series title after loading', async () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('series-detail')).toBeDefined()
    })

    expect(screen.getByTestId('series-title').textContent).toContain('Breaking Bad')
  })

  it('renders series overview', async () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('series-overview')).toBeDefined()
    })

    expect(screen.getByTestId('series-overview').textContent).toContain('chemistry teacher')
  })

  it('renders seasons section', async () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('seasons-section')).toBeDefined()
    })
  })

  it('renders season cards', async () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('season-card-1')).toBeDefined()
      expect(screen.getByTestId('season-card-2')).toBeDefined()
    })
  })

  it('renders back button', async () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('series-back-btn')).toBeDefined()
    })
  })

  it('renders skeleton during loading', () => {
    render(<SeriesDetail />, { wrapper: createWrapper() })

    expect(screen.getByTestId('series-detail-skeleton')).toBeDefined()
  })

  it('renders not found for invalid series', async () => {
    server.use(
      http.get('/api/v1/series/:id', () => {
        return HttpResponse.json(
          { ok: false, error: { code: 'NOT_FOUND', message: 'Series not found' } },
          { status: 404 },
        )
      }),
    )

    render(<SeriesDetail />, { wrapper: createWrapper(['/series/99999']) })

    await waitFor(() => {
      expect(screen.getByTestId('series-not-found')).toBeDefined()
    })
  })
})

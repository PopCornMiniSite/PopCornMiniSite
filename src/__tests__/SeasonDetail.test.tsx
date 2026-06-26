import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import SeasonDetail from '@/pages/SeasonDetail'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

function createWrapper(initialEntries = ['/series/1396/season/1']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/series/:id/season/:seasonNum" element={children} />
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('SeasonDetail', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders season title after loading', async () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('season-detail')).toBeDefined()
    })

    expect(screen.getByTestId('season-title').textContent).toContain('Season 1')
  })

  it('renders season overview', async () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('season-overview')).toBeDefined()
    })

    expect(screen.getByTestId('season-overview').textContent).toContain('Walter White')
  })

  it('renders episodes list', async () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('episodes-list')).toBeDefined()
    })
  })

  it('renders individual episode rows', async () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('episode-1')).toBeDefined()
      expect(screen.getByTestId('episode-2')).toBeDefined()
      expect(screen.getByTestId('episode-3')).toBeDefined()
    })
  })

  it('renders back button', async () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('season-back-btn')).toBeDefined()
    })
  })

  it('renders skeleton during loading', () => {
    render(<SeasonDetail />, { wrapper: createWrapper() })

    expect(screen.getByTestId('season-detail-skeleton')).toBeDefined()
  })

  it('renders not found for invalid season', async () => {
    server.use(
      http.get('/api/v1/series/:id/season/:seasonNum', () => {
        return HttpResponse.json(
          { ok: false, error: { code: 'NOT_FOUND', message: 'Season not found' } },
          { status: 404 },
        )
      }),
    )

    render(<SeasonDetail />, { wrapper: createWrapper(['/series/1396/season/99']) })

    await waitFor(() => {
      expect(screen.getByTestId('season-not-found')).toBeDefined()
    })
  })
})

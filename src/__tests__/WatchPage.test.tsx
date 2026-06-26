import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import WatchPage from '@/pages/WatchPage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '@/mocks/node'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

function createWrapper(initialEntries = ['/watch/movie/550988']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/watch/:type/:id" element={children} />
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('WatchPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('renders the watch page after stream loads', async () => {
    render(<WatchPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('watch-page')).toBeDefined()
    })
  })

  it('renders video player with stream URL', async () => {
    render(<WatchPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeDefined()
    })
  })

  it('renders back button in header', async () => {
    render(<WatchPage />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByTestId('watch-header-back')).toBeDefined()
    })
  })

  it('renders loading skeleton while stream loads', () => {
    render(<WatchPage />, { wrapper: createWrapper() })

    expect(screen.queryByTestId('watch-page')).toBeNull()
  })

  it('shows error state when stream fails', async () => {
    server.use(
      http.get('/api/v1/stream/movie/:id', () => {
        return HttpResponse.json(
          { ok: false, error: { code: 'STREAM_ERROR', message: 'Stream not found' } },
          { status: 404 },
        )
      }),
    )

    render(<WatchPage />, { wrapper: createWrapper(['/watch/movie/99999']) })

    await waitFor(() => {
      expect(screen.getByTestId('watch-error')).toBeDefined()
    })
  })

  it('supports episode type with search params', async () => {
    render(
      <WatchPage />,
      { wrapper: createWrapper(['/watch/episode/101?season=1&ep=1&title=Pilot']) },
    )

    await waitFor(() => {
      expect(screen.getByTestId('watch-page')).toBeDefined()
    })
  })
})

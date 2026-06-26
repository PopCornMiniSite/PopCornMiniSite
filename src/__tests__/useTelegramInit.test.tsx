import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useTelegramInit } from '@/hooks/useTelegramInit'
import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

function TestComponent() {
  const state = useTelegramInit()
  return (
    <div>
      <span data-testid="loading">{String(state.isLoading)}</span>
      <span data-testid="mock">{String(state.isMock)}</span>
      <span data-testid="user-id">{state.user?.id ?? 'null'}</span>
      <span data-testid="first-name">{state.user?.firstName ?? 'null'}</span>
    </div>
  )
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('useTelegramInit', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses mock user when Telegram WebApp has no user data', () => {
    const originalTelegram = window.Telegram
    window.Telegram = {
      WebApp: {
        ...originalTelegram?.WebApp,
        initData: '',
        initDataUnsafe: {},
      },
    }

    render(<TestComponent />, { wrapper: Wrapper })

    expect(screen.getByTestId('loading')).toHaveTextContent('false')
    expect(screen.getByTestId('mock')).toHaveTextContent('true')
    expect(screen.getByTestId('user-id')).toHaveTextContent('5703679073')
    expect(screen.getByTestId('first-name')).toHaveTextContent('مطور')

    window.Telegram = originalTelegram
  })

  it('uses real user when Telegram WebApp has user data', () => {
    const originalTelegram = window.Telegram
    window.Telegram = {
      WebApp: {
        ...originalTelegram?.WebApp,
        initData: 'real_init_data',
        initDataUnsafe: {
          user: {
            id: 99999,
            first_name: 'Real',
            last_name: 'User',
            username: 'realuser',
            language_code: 'en',
          },
        },
      },
    }

    render(<TestComponent />, { wrapper: Wrapper })

    expect(screen.getByTestId('mock')).toHaveTextContent('false')
    expect(screen.getByTestId('user-id')).toHaveTextContent('99999')
    expect(screen.getByTestId('first-name')).toHaveTextContent('Real')

    window.Telegram = originalTelegram
  })
})

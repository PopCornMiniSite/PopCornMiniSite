import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from '@/components/layout/Header'
import { TelegramProvider } from '@/providers/TelegramProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <TelegramProvider>{children}</TelegramProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Header', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders app name', () => {
    render(<Header />, { wrapper: Wrapper })
    expect(screen.getByText('PopCorn')).toBeDefined()
  })

  it('has data-testid', () => {
    render(<Header />, { wrapper: Wrapper })
    expect(screen.getByTestId('app-header')).toBeDefined()
  })

  it('shows DEV badge and user name in mock mode', () => {
    const originalTelegram = window.Telegram
    window.Telegram = {
      WebApp: {
        ...originalTelegram?.WebApp,
        initData: '',
        initDataUnsafe: {},
      },
    }

    render(<Header />, { wrapper: Wrapper })

    expect(screen.getByText('DEV')).toBeDefined()
    expect(screen.getByText('مطور')).toBeDefined()

    window.Telegram = originalTelegram
  })

  it('shows real user name in non-mock mode', () => {
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

    render(<Header />, { wrapper: Wrapper })

    expect(screen.getByText('Real')).toBeDefined()
    expect(screen.queryByText('DEV')).toBeNull()

    window.Telegram = originalTelegram
  })
})

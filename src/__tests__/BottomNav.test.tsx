import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from '@/components/layout/BottomNav'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

function Wrapper({ children, initialEntries = ['/'] }: { children: ReactNode; initialEntries?: string[] }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('BottomNav', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders all navigation items', () => {
    render(<BottomNav />, { wrapper: Wrapper })

    expect(screen.getByTestId('nav-home')).toBeDefined()
    expect(screen.getByTestId('nav-discover')).toBeDefined()
    expect(screen.getByTestId('nav-store')).toBeDefined()
    expect(screen.getByTestId('nav-downloads')).toBeDefined()
    expect(screen.getByTestId('nav-community')).toBeDefined()
    expect(screen.getByTestId('nav-profile')).toBeDefined()
  })

  it('has data-testid', () => {
    render(<BottomNav />, { wrapper: Wrapper })

    expect(screen.getByTestId('bottom-nav')).toBeDefined()
  })

  it('marks current route as active', () => {
    render(<BottomNav />, { wrapper: ({ children }) => <Wrapper initialEntries={['/discover']}>{children}</Wrapper> })

    const discoverBtn = screen.getByTestId('nav-discover')
    expect(discoverBtn.className).toContain('text-[#FF6B35]')
  })
})

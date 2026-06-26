import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from 'i18next'
import enCommon from '@/i18n/locales/en/common'
import enStore from '@/i18n/locales/en/store'

import { WalletDashboard } from '@/components/store/WalletDashboard'
import { DailyStreakCard } from '@/components/store/DailyStreakCard'
import { EarningPaths } from '@/components/store/EarningPaths'
import { ProductCard } from '@/components/store/ProductCard'
import type { Product } from '@/types/product'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

const testI18n = i18n.createInstance()
testI18n.init({
  lng: 'en',
  resources: { en: { common: enCommon, store: enStore } },
  ns: ['common', 'store'],
  interpolation: { escapeValue: false },
})

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient()
  return (
    <QueryClientProvider client={qc}>
      <I18nextProvider i18n={testI18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  )
}

const mockProduct: Product = {
  id: 'test-product',
  name: 'Test Product',
  description: 'A test product',
  category: 'theme',
  rarity: 'rare',
  price_stars: 30,
  price_kernels: 500,
  payment_method: 'both',
  image_url: '',
  preview_images: [],
  assets: [],
  is_purchasable: true,
  is_limited: false,
  sold_count: 100,
  tags: ['test'],
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

describe('WalletDashboard', () => {
  beforeEach(() => {
    // Reset MSW handlers
  })

  it('renders wallet balances', async () => {
    render(<WalletDashboard />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('wallet-dashboard')).toBeInTheDocument()
    })
  })
})

describe('DailyStreakCard', () => {
  it('renders streak info', async () => {
    render(<DailyStreakCard />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('daily-streak-card')).toBeInTheDocument()
    })
  })

  it('shows claim button when not claimed', async () => {
    render(<DailyStreakCard />, { wrapper: Wrapper })

    await waitFor(() => {
      const claimBtn = screen.getByTestId('claim-streak-button')
      expect(claimBtn).toBeInTheDocument()
    })
  })
})

describe('EarningPaths', () => {
  it('renders earning history', async () => {
    render(<EarningPaths />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByTestId('earning-paths')).toBeInTheDocument()
    })
  })
})

describe('ProductCard hybrid pricing', () => {
  it('renders both kernels and stars prices', async () => {
    const onBuy = vi.fn()

    render(
      <Wrapper>
        <ProductCard
          product={mockProduct}
          userKernels={1000}
          userStars={50}
          onBuy={onBuy}
        />
      </Wrapper>,
    )

    const card = screen.getByTestId('product-card')
    expect(card).toBeInTheDocument()

    expect(screen.getByText('500')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('shows buy button enabled when user can afford', async () => {
    const onBuy = vi.fn()

    render(
      <Wrapper>
        <ProductCard
          product={mockProduct}
          userKernels={1000}
          userStars={50}
          onBuy={onBuy}
        />
      </Wrapper>,
    )

    const buyBtn = screen.getByTestId('buy-button-test-product')
    expect(buyBtn).not.toBeDisabled()
  })

  it('shows buy button disabled when user cannot afford', async () => {
    const onBuy = vi.fn()

    render(
      <Wrapper>
        <ProductCard
          product={mockProduct}
          userKernels={100}
          userStars={10}
          onBuy={onBuy}
        />
      </Wrapper>,
    )

    const buyBtn = screen.getByTestId('buy-button-test-product')
    expect(buyBtn).toBeDisabled()
  })

  it('calls onBuy when buy button clicked', async () => {
    const user = userEvent.setup()
    const onBuy = vi.fn()

    render(
      <Wrapper>
        <ProductCard
          product={mockProduct}
          userKernels={1000}
          userStars={50}
          onBuy={onBuy}
        />
      </Wrapper>,
    )

    const buyBtn = screen.getByTestId('buy-button-test-product')
    await user.click(buyBtn)
    expect(onBuy).toHaveBeenCalledWith(mockProduct)
  })
})

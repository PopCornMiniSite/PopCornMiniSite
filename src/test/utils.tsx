import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  queryClient?: QueryClient
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { initialEntries = ['/'], queryClient = createTestQueryClient(), ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={initialEntries}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MemoryRouter>
      </I18nextProvider>
    ),
    ...renderOptions,
  })
}

export { customRender as render }
export { createTestQueryClient }

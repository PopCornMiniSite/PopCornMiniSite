import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '@/mocks/node'
import './i18n'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

class MediaMetadataMock {
  constructor(init?: MediaMetadataInit) {
    if (init) {
      Object.assign(this, init)
    }
  }
}

Object.defineProperty(window, 'MediaMetadata', {
  writable: true,
  value: MediaMetadataMock,
})

Object.defineProperty(window, 'Telegram', {
  value: {
    WebApp: {
      initData: '',
      initDataUnsafe: {
        user: {
          id: 5703679073,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'en',
          isPremium: true,
        },
      },
      themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#999999',
        link_color: '#2481cc',
        button_color: '#2481cc',
        button_text_color: '#ffffff',
        secondary_bg_color: '#f4f4f5',
        header_bg_color: '#efeff3',
        accent_text_color: '#ff6b35',
        section_bg_color: '#ffffff',
        section_header_text_color: '#2481cc',
        subtitle_text_color: '#666666',
        destructive_text_color: '#ff3b30',
      },
      colorScheme: 'light',
      isDark: false,
      onEvent: vi.fn(),
      offEvent: vi.fn(),
      ready: vi.fn(),
      expand: vi.fn(),
      close: vi.fn(),
      hapticFeedback: {
        impactOccurred: vi.fn(),
        notificationOccurred: vi.fn(),
        selectionChanged: vi.fn(),
      },
    },
  },
  writable: true,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverMock,
})

class IntersectionObserverMock {
  root = null
  rootMargin = ''
  thresholds = [0]
  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    void _callback
    void _options
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn().mockReturnValue([])
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: IntersectionObserverMock,
})

vi.stubEnv('VITE_API_URL', '')

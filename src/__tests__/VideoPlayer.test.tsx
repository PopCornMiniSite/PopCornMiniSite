import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { VideoPlayer } from '@/components/VideoPlayer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
}

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the video player container', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test Video"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('video-player')).toBeDefined()
  })

  it('renders play/pause button', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('play-pause-btn')).toBeDefined()
  })

  it('renders seek slider', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('seek-slider')).toBeDefined()
  })

  it('renders fullscreen button', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('fullscreen-btn')).toBeDefined()
  })

  it('renders settings button', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('settings-btn')).toBeDefined()
  })

  it('renders skip back and forward buttons', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('skip-back-btn')).toBeDefined()
    expect(screen.getByTestId('skip-forward-btn')).toBeDefined()
  })

  it('renders video element', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByTestId('video-element')).toBeDefined()
  })

  it('opens settings menu on click', async () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )

    await act(async () => {
      fireEvent.click(screen.getByTestId('settings-btn'))
    })

    expect(screen.getByTestId('settings-menu')).toBeDefined()
  })

  it('has accessible region role', () => {
    const wrapper = createWrapper()
    render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test Video"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )
    expect(screen.getByRole('region', { name: 'Test Video' })).toBeDefined()
  })

  it('shows error state and retry button on error', () => {
    const wrapper = createWrapper()
    const { container } = render(
      <VideoPlayer
        url="https://example.com/video.mp4"
        title="Test"
        type="movie"
        contentId={1}
      />,
      { wrapper },
    )

    const video = container.querySelector('video')
    if (video) {
      Object.defineProperty(video, 'error', {
        value: { code: 3, message: 'Decode error' },
      })
      fireEvent.error(video)
    }

    expect(screen.getByTestId('video-player-error')).toBeDefined()
    expect(screen.getByTestId('video-player-retry')).toBeDefined()
  })
})

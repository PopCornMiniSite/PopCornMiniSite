import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMediaSession } from '@/hooks/useMediaSession'

describe('useMediaSession', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaSession', {
      value: {
        metadata: null,
        setActionHandler: vi.fn(),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sets media metadata', () => {
    const options = {
      title: 'Test Movie',
      artist: 'PopCorn',
      onPlay: vi.fn(),
      onPause: vi.fn(),
    }
    renderHook(() => useMediaSession(options))

    expect(navigator.mediaSession.metadata).toBeDefined()
    expect(navigator.mediaSession.metadata?.title).toBe('Test Movie')
  })

  it('registers action handlers', () => {
    const options = {
      title: 'Test',
      onPlay: vi.fn(),
      onPause: vi.fn(),
    }
    renderHook(() => useMediaSession(options))

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('play', expect.any(Function))
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('pause', expect.any(Function))
  })

  it('cleans up action handlers on unmount', () => {
    const options = {
      title: 'Test',
      onPlay: vi.fn(),
      onPause: vi.fn(),
    }
    const { unmount } = renderHook(() => useMediaSession(options))
    unmount()

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('play', null)
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('pause', null)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('returns a sentinelRef function', () => {
    const { result } = renderHook(() =>
      useInfiniteScroll({
        onLoadMore: vi.fn(),
        hasMore: true,
        isLoading: false,
      })
    )

    expect(typeof result.current.sentinelRef).toBe('function')
  })

  it('does not call onLoadMore when loading', () => {
    const onLoadMore = vi.fn()
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: true,
        isLoading: true,
      })
    )

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('does not call onLoadMore when no more items', () => {
    const onLoadMore = vi.fn()
    renderHook(() =>
      useInfiniteScroll({
        onLoadMore,
        hasMore: false,
        isLoading: false,
      })
    )

    expect(onLoadMore).not.toHaveBeenCalled()
  })
})

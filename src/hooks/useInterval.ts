import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

export function useLongPress(
  callback: () => void,
  { delay = 500 }: { delay?: number } = {},
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const start = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      callbackRef.current()
    }, delay)
  }, [delay])

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  } as const
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', callback)
      return () => mediaQuery.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

export function useOrientation() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback)
      return () => window.removeEventListener('resize', callback)
    },
    () => (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),
    () => 'portrait' as const,
  )
}

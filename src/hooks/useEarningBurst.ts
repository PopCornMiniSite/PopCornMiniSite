import { useState, useCallback } from 'react'

export function useEarningBurst() {
  const [burst, setBurst] = useState<{ amount: number; x: number; y: number } | null>(null)

  const trigger = useCallback((amount: number, x?: number, y?: number) => {
    setBurst({ amount, x: x ?? window.innerWidth / 2, y: y ?? window.innerHeight / 2 })
  }, [])

  const dismiss = useCallback(() => setBurst(null), [])

  return { burst, trigger, dismiss }
}

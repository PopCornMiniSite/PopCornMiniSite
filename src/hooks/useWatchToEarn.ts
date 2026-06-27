import { useRef, useCallback, useEffect, useState } from 'react'
import { useWalletStore } from '@/stores/walletStore'
import { toast } from 'sonner'

const EARN_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes
const KERNELS_PER_INTERVAL = 5

export function useWatchToEarn() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const creditKernels = useWalletStore((s) => s.creditKernels)

  const startTracking = useCallback(() => {
    if (timerRef.current) return

    timerRef.current = setInterval(() => {
      elapsedRef.current += 1000
      setProgress(elapsedRef.current / EARN_INTERVAL_MS)

      if (elapsedRef.current >= EARN_INTERVAL_MS) {
        elapsedRef.current = 0
        setProgress(0)
        creditKernels(KERNELS_PER_INTERVAL)
        // TODO: Call API POST /api/v1/user/me/wallet/kernels/earn to persist kernels on the server
        toast.success(`+${KERNELS_PER_INTERVAL} PopCorn Kernels earned!`, {
          duration: 3000,
        })
      }
    }, 1000)
  }, [creditKernels])

  const stopTracking = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetTracking = useCallback(() => {
    elapsedRef.current = 0
    setProgress(0)
    stopTracking()
  }, [stopTracking])

  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  return {
    startTracking,
    stopTracking,
    resetTracking,
    progress,
  }
}

import { create } from 'zustand'
import type { EarningPath } from '@/types/wallet'

interface EarningAnimation {
  id: string
  amount: number
  path: EarningPath
  x: number
  y: number
}

interface KernelsEarningState {
  dailyStreak: number
  lastClaimDate: string | null
  todayClaimed: boolean
  pendingAnimations: EarningAnimation[]
  setDailyStreak: (streak: number, lastClaim: string | null, claimed: boolean) => void
  addPendingAnimation: (amount: number, path: EarningPath, x: number, y: number) => void
  removePendingAnimation: (id: string) => void
  clearAnimations: () => void
  reset: () => void
}

const initialState = {
  dailyStreak: 0,
  lastClaimDate: null,
  todayClaimed: false,
  pendingAnimations: [] as EarningAnimation[],
}

export const useKernelsEarningStore = create<KernelsEarningState>((set) => ({
  ...initialState,
  setDailyStreak: (streak, lastClaim, claimed) =>
    set({ dailyStreak: streak, lastClaimDate: lastClaim, todayClaimed: claimed }),
  addPendingAnimation: (amount, path, x, y) =>
    set((s) => ({
      pendingAnimations: [
        ...s.pendingAnimations,
        { id: `${Date.now()}-${Math.random().toString(36).substring(2)}`, amount, path, x, y },
      ],
    })),
  removePendingAnimation: (id) =>
    set((s) => ({
      pendingAnimations: s.pendingAnimations.filter((a) => a.id !== id),
    })),
  clearAnimations: () => set({ pendingAnimations: [] }),
  reset: () => set(initialState),
}))

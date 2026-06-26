import { create } from 'zustand'

interface WalletState {
  starsBalance: number
  kernelsBalance: number
  totalEarnedKernels: number
  totalSpentKernels: number
  isLoading: boolean
  setBalances: (stars: number, kernels: number) => void
  setKernelsStats: (earned: number, spent: number) => void
  debitKernels: (amount: number) => void
  creditKernels: (amount: number) => void
  debitStars: (amount: number) => void
  setIsLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  starsBalance: 0,
  kernelsBalance: 0,
  totalEarnedKernels: 0,
  totalSpentKernels: 0,
  isLoading: false,
}

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,
  setBalances: (stars, kernels) =>
    set({ starsBalance: stars, kernelsBalance: kernels }),
  setKernelsStats: (earned, spent) =>
    set({ totalEarnedKernels: earned, totalSpentKernels: spent }),
  debitKernels: (amount) =>
    set((s) => ({
      kernelsBalance: Math.max(0, s.kernelsBalance - amount),
      totalSpentKernels: s.totalSpentKernels + amount,
    })),
  creditKernels: (amount) =>
    set((s) => ({
      kernelsBalance: s.kernelsBalance + amount,
      totalEarnedKernels: s.totalEarnedKernels + amount,
    })),
  debitStars: (amount) =>
    set((s) => ({
      starsBalance: Math.max(0, s.starsBalance - amount),
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  reset: () => set(initialState),
}))

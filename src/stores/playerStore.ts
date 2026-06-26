import { create } from 'zustand'

interface PlayerState {
  isPlaying: boolean
  currentPosition: number
  duration: number
  volume: number
  isFullscreen: boolean
  streamUrl: string | null
  play: () => void
  pause: () => void
  seek: (position: number) => void
  setVolume: (volume: number) => void
  toggleFullscreen: () => void
  setStreamUrl: (url: string) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentPosition: 0,
  duration: 0,
  volume: 1,
  isFullscreen: false,
  streamUrl: null,
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (position) => set({ currentPosition: position }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  setStreamUrl: (url) => set({ streamUrl: url }),
}))

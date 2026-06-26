import { create } from 'zustand'

interface AtmosphereState {
  posterUrl: string | null
  backdropUrl: string | null
  setAtmosphere: (poster: string, backdrop: string) => void
  clearAtmosphere: () => void
}

export const useAtmosphereStore = create<AtmosphereState>((set) => ({
  posterUrl: null,
  backdropUrl: null,
  setAtmosphere: (posterUrl, backdropUrl) => set({ posterUrl, backdropUrl }),
  clearAtmosphere: () => set({ posterUrl: null, backdropUrl: null }),
}))
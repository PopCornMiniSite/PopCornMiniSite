import { create } from 'zustand'

interface UiState {
  activeTab: string
  isDark: boolean
  pageTitle: string
  activePartyTab: 'chat' | 'participants'
  storeCategory: string
  setActiveTab: (tab: string) => void
  toggleTheme: () => void
  setPageTitle: (title: string) => void
  setActivePartyTab: (tab: 'chat' | 'participants') => void
  setStoreCategory: (category: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTab: 'home',
  isDark: false,
  pageTitle: '',
  activePartyTab: 'chat',
  storeCategory: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
  setPageTitle: (title) => set({ pageTitle: title }),
  setActivePartyTab: (tab) => set({ activePartyTab: tab }),
  setStoreCategory: (category) => set({ storeCategory: category }),
}))

import { create } from 'zustand'

interface StoreState {
  selectedCategory: string
  sortBy: string
  searchQuery: string
  setCategory: (category: string) => void
  setSortBy: (sort: string) => void
  setSearchQuery: (query: string) => void
}

export const useStoreStore = create<StoreState>((set) => ({
  selectedCategory: 'all',
  sortBy: 'popular',
  searchQuery: '',
  setCategory: (category) => set({ selectedCategory: category }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

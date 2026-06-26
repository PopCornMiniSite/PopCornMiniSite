import { create } from 'zustand'
import type { Friend, FriendRequest } from '@/types/user'

interface FriendState {
  friends: Friend[]
  requests: FriendRequest[]
  setFriends: (friends: Friend[]) => void
  setRequests: (requests: FriendRequest[]) => void
  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void
  removeRequest: (requestId: string) => void
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  requests: [],
  setFriends: (friends) => set({ friends }),
  setRequests: (requests) => set({ requests }),
  addFriend: (friend) =>
    set((s) => ({
      friends: [...s.friends.filter((f) => f.id !== friend.id), friend],
    })),
  removeFriend: (friendId) =>
    set((s) => ({
      friends: s.friends.filter((f) => f.id !== friendId),
    })),
  removeRequest: (requestId) =>
    set((s) => ({
      requests: s.requests.filter((r) => r.id !== requestId),
    })),
}))

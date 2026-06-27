import { create } from 'zustand'
import type { Participant, PartyMessage } from '@/types/party'

export interface PlaybackState {
  is_playing: boolean
  position: number
  timestamp: number
  playback_rate: number
}

interface PartyState {
  roomCode: string | null
  participants: Participant[]
  role: 'leader' | 'follower' | null
  playbackState: PlaybackState
  chatMessages: PartyMessage[]
  reactions: Record<string, string[]>
  isAllReady: boolean
  isBuffering: Record<string, boolean>
  error: string | null
  isConnected: boolean
  setRoomCode: (code: string | null) => void
  setParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  removeParticipant: (userId: string) => void
  setRole: (role: 'leader' | 'follower' | null) => void
  setPlaybackState: (state: Partial<PlaybackState>) => void
  addChatMessage: (message: PartyMessage) => void
  setChatMessages: (messages: PartyMessage[]) => void
  addReaction: (messageId: string, emoji: string, userId: string) => void
  setIsAllReady: (ready: boolean) => void
  setBuffering: (userId: string, isBuffering: boolean) => void
  setError: (error: string | null) => void
  setIsConnected: (connected: boolean) => void
  setParticipantReady: (userId: string, isReady: boolean) => void
  reset: () => void
}

const initialState = {
  roomCode: null,
  participants: [],
  role: null,
  playbackState: {
    is_playing: false,
    position: 0,
    timestamp: Date.now(),
    playback_rate: 1,
  },
  chatMessages: [],
  reactions: {},
  isAllReady: false,
  isBuffering: {},
  error: null,
  isConnected: false,
}

export const usePartyStore = create<PartyState>((set) => ({
  ...initialState,
  setRoomCode: (code) => set({ roomCode: code }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((s) => ({
      participants: [...s.participants.filter((p) => p.user_id !== participant.user_id), participant],
    })),
  removeParticipant: (userId) =>
    set((s) => ({
      participants: s.participants.filter((p) => p.user_id !== userId),
    })),
  setRole: (role) => set({ role }),
  setPlaybackState: (state) =>
    set((s) => ({
      playbackState: { ...s.playbackState, ...state, timestamp: Date.now() },
    })),
  addChatMessage: (message) =>
    set((s) => ({
      chatMessages: [...s.chatMessages, message],
    })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addReaction: (messageId, emoji, userId) =>
    set((s) => {
      const key = `${messageId}:${emoji}`
      const existing = s.reactions[key] ?? []
      const hasReacted = existing.includes(userId)
      return {
        reactions: {
          ...s.reactions,
          [key]: hasReacted ? existing.filter((id) => id !== userId) : [...existing, userId],
        },
      }
    }),
  setIsAllReady: (ready) => set({ isAllReady: ready }),
  setBuffering: (userId, isBuffering) =>
    set((s) => ({
      isBuffering: { ...s.isBuffering, [userId]: isBuffering },
    })),
  setError: (error) => set({ error }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setParticipantReady: (userId, isReady) =>
    set((s) => ({
      participants: s.participants.map((p) =>
        p.user_id === userId ? { ...p, is_ready: isReady } : p
      ),
    })),
  reset: () => set(initialState),
}))

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useChatStore = create((set, get) => ({
  conversations: [],
  messages: [],
  activeConversation: null,
  typingUsers: {},
  onlineUsers: {},
  loading: false,

  fetchConversations: async (userId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('chat_members')
      .select('conversation_id, chat_conversations(*)')
      .eq('profile_id', userId)
    if (!error && data) {
      set({
        conversations: data.map((d) => d.chat_conversations).filter(Boolean),
        loading: false,
      })
    } else {
      set({ loading: false })
    }
  },

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  fetchMessages: async (conversationId) => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, sender:profiles!sender_id(first_name, username)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100)
    if (!error && data) {
      set({ messages: data, loading: false })
    } else {
      set({ loading: false })
    }
  },

  sendMessage: async (conversationId, userId, content, messageType = 'text') => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        message_type: messageType,
      })
      .select()
      .single()
    if (!error && data) {
      set((state) => ({ messages: [...state.messages, data] }))
    }
    return { data, error }
  },

  subscribeToMessages: (conversationId, callback) => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (callback) callback(payload.new)
          set((state) => {
            if (state.messages.some((m) => m.id === payload.new.id)) return state
            return { messages: [...state.messages, payload.new] }
          })
        }
      )
      .subscribe()
    return () => supabase.removeChannel(subscription)
  },

  subscribeToTyping: (conversationId, callback) => {
    const subscription = supabase
      .channel(`typing:${conversationId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'typing_indicators', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          if (callback) callback(payload.new)
        }
      )
      .subscribe()
    return () => supabase.removeChannel(subscription)
  },

  emitTyping: async (conversationId, userId) => {
    await supabase.from('typing_indicators').insert({
      conversation_id: conversationId,
      profile_id: userId,
    })
  },

  subscribeToOnlineStatus: (callback) => {
    const subscription = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = subscription.presenceState()
        if (callback) callback(state)
      })
      .subscribe()
    return () => supabase.removeChannel(subscription)
  },

  createConversation: async (title, type = 'private', participantIds = []) => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ title, type })
      .select()
      .single()
    if (!error && data && participantIds.length > 0) {
      const participants = participantIds.map((uid) => ({
        conversation_id: data.id,
        profile_id: uid,
      }))
      await supabase.from('chat_members').insert(participants)
    }
    return { data, error }
  },
}))

export default useChatStore

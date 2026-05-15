import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import useChatStore from '../store/chatStore'
import ChatBubble from '../components/ChatBubble'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function Chat() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const {
    conversations, messages, activeConversation, loading,
    fetchConversations, fetchMessages, sendMessage,
    setActiveConversation, subscribeToMessages,
  } = useChatStore()

  const [input, setInput] = useState('')
  const [view, setView] = useState('list')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (user) fetchConversations(user.id)
  }, [user, fetchConversations])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id)
      const unsub = subscribeToMessages(activeConversation.id)
      return unsub
    }
  }, [activeConversation, fetchMessages, subscribeToMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !user || !activeConversation) return
    await sendMessage(activeConversation.id, user.id, input.trim())
    setInput('')
  }

  const openConversation = (conv) => {
    setActiveConversation(conv)
    setView('chat')
  }

  const handleBack = () => {
    setActiveConversation(null)
    setView('list')
  }

  if (view === 'list') {
    return (
      <div className="pb-24">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-2xl font-bold">{t('chat.title')}</h1>
        </div>
        <div className="px-4">
          {loading ? (
            <LoadingSpinner text={t('common.loading')} />
          ) : conversations.length === 0 ? (
            <EmptyState message={t('chat.noMessages')} />
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className="w-full flex items-center gap-3 p-3 bg-card rounded-xl hover:bg-card-hover transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{conv.name || 'Conversation'}</p>
                    <p className="text-xs text-muted line-clamp-1">{conv.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 flex flex-col h-[calc(100vh-80px)]">
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={handleBack} className="w-8 h-8 rounded-full bg-surface flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">{activeConversation?.name || t('chat.title')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted text-center mt-8">{t('chat.noMessages')}</p>
        ) : (
          messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg.content}
              isOwn={msg.sender_id === user?.id}
              senderName={msg.sender?.first_name || msg.sender?.username || 'User'}
              timestamp={msg.created_at}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.typeMessage')}
            className="flex-1 tg-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="tg-btn !p-3 !rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

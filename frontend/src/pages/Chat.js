import React, { useEffect, useState, useRef } from 'react'
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
      <div style={{ paddingBottom: '96px' }}>
        <div style={{ padding: '16px 16px 12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('chat.title')}</h1>
        </div>
        <div style={{ padding: '0 16px' }}>
          {loading ? (
            <LoadingSpinner text={t('common.loading')} />
          ) : conversations.length === 0 ? (
            <EmptyState message={t('chat.noMessages')} />
          ) : (
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', backgroundColor: '#1A1A2E', borderRadius: '12px',
                    border: 'none', cursor: 'pointer', color: '#fff',
                    textAlign: 'left', marginBottom: '8px',
                  }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#141428', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: '14px', margin: 0 }}>{conv.name || 'Conversation'}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{conv.type}</p>
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
    <div style={{ paddingBottom: '96px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={handleBack} style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#141428', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{activeConversation?.name || t('chat.title')}</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
        {messages.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '32px' }}>{t('chat.noMessages')}</p>
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

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat.typeMessage')}
            style={{
              flex: 1, backgroundColor: '#141428', color: '#fff',
              borderRadius: '12px', padding: '12px 16px',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '14px', outline: 'none',
            }}
            onFocus={(e) => e.target.style.borderColor = '#E50914'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              backgroundColor: '#E50914', color: '#fff', border: 'none',
              borderRadius: '12px', padding: '12px', cursor: input.trim() ? 'pointer' : 'not-allowed',
              opacity: input.trim() ? 1 : 0.5,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

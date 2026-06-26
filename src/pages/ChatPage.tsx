import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useTelegram } from '@/providers/TelegramProvider'
import { useMessages, useSendMessage } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

export default function ChatPage() {
  const { t } = useTranslation()
  const { conversationId } = useParams<{ conversationId: string }>()
  const { user } = useTelegram()
  const currentUserId = user?.id ?? 0
  const { data: messages, isLoading } = useMessages(conversationId ?? '')
  const sendMessage = useSendMessage()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || !conversationId) return
    sendMessage.mutate({ conversationId, content: input.trim() })
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]" data-testid="chat-page">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`h-10 rounded-xl bg-bg-tertiary animate-pulse ${i % 2 === 0 ? 'w-3/4 ml-auto' : 'w-3/4'}`} />
          ))
        ) : messages?.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              data-testid="chat-message"
            >
              <div className={`max-w-[75%] rounded-xl px-3 py-2 ${
                isMe
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-tertiary border border-border-subtle text-text-primary'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-text-tertiary'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 p-4 border-t border-border-subtle bg-bg-secondary">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('social:type_message')}
          className="flex-1 rounded-xl bg-bg-tertiary border border-border-default px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
          data-testid="chat-input"
        />
        <Button onClick={handleSend} disabled={!input.trim()} iconLeft={<Send className="w-4 h-4" />} data-testid="send-button" />
      </div>
    </div>
  )
}

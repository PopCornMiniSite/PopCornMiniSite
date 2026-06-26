import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePartyStore } from '@/stores/partyStore'
import { Button } from '@/components/ui/button'

interface PartyChatProps {
  onSendMessage?: (content: string) => void
}

export function PartyChat({ onSendMessage }: PartyChatProps) {
  const { t } = useTranslation()
  const { chatMessages } = usePartyStore()
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSend = () => {
    if (!message.trim()) return
    onSendMessage?.(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full" data-testid="party-chat">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {chatMessages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {t('party:no_messages')}
          </p>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg p-2 ${
                msg.type === 'system'
                  ? 'bg-muted text-center text-xs text-muted-foreground'
                  : 'bg-secondary'
              }`}
              data-testid="chat-message"
            >
              {msg.type !== 'system' && (
                <span className="text-xs font-medium text-primary">{msg.user_name}: </span>
              )}
              <span className="text-sm">{msg.content}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2 p-2 border-t border-border">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('party:type_message')}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          data-testid="chat-input"
        />
        <Button size="sm" onClick={handleSend} disabled={!message.trim()} data-testid="send-message">
          {t('party:send')}
        </Button>
      </div>
    </div>
  )
}

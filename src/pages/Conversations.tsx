import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useConversations } from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function ConversationsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: conversations, isLoading } = useConversations()

  return (
    <div className="p-4" data-testid="conversations-page">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : !conversations?.length ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('social:no_conversations')}
        </p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => navigate(`/community/chat/${conv.id}`)}
              data-testid="conversation-item"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback>{conv.other_user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{conv.other_user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
              </div>
              {conv.unread_count > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {conv.unread_count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

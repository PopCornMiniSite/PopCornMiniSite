import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { User, MessageCircle, ThumbsUp, Play, Star } from 'lucide-react'
import { useNotifications, useMarkNotificationRead } from '@/lib/api'
import { useNotificationStore } from '@/stores/notificationStore'
import { Badge } from '@/components/ui/badge'

interface NotificationBellProps {
  onClick?: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data } = useNotifications()
  const { unreadCount, setNotifications } = useNotificationStore()

  useEffect(() => {
    if (data) {
      setNotifications(data.data)
    }
  }, [data, setNotifications])

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-secondary transition-colors"
      data-testid="notification-bell"
    >
      <span className="text-xl">🔔</span>
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          data-testid="notification-count"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </button>
  )
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { t } = useTranslation()
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()

  if (!open) return null

  const notifications = data?.data ?? []

  const getNotificationIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'friend_request': return <User className="w-5 h-5" />
      case 'comment_reply': return <MessageCircle className="w-5 h-5" />
      case 'rating_like': return <ThumbsUp className="w-5 h-5" />
      case 'party_started': return <Play className="w-5 h-5" />
      case 'purchase_completed': return <Star className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 h-full w-80 bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="notification-drawer"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('notifications:title')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded">✕</button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {t('notifications:no_notifications')}
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 border-b border-border ${
                  !n.is_read ? 'bg-secondary/50' : ''
                }`}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id)
                }}
                data-testid="notification-item"
              >
                <span className="w-5 h-5 mt-0.5">{getNotificationIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

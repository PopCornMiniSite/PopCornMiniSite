export type NotificationType =
  | 'friend_request'
  | 'friend_accepted'
  | 'comment_reply'
  | 'comment_like'
  | 'rating_like'
  | 'party_invite'
  | 'party_started'
  | 'purchase_completed'
  | 'achievement_unlocked'
  | 'system'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface NotificationsResponse {
  data: Notification[]
  items: {
    total: number
    unread_count: number
    has_more: boolean
  }
}

export interface MarkNotificationReadResponse {
  data: Notification
}

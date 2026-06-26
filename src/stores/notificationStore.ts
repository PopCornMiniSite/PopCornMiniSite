import { create } from 'zustand'
import type { Notification } from '@/types/notification'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  hasFetched: boolean
  setNotifications: (notifications: Notification[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Notification) => void
  setHasFetched: (fetched: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  hasFetched: false,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.is_read).length,
    }),
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    })),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.is_read ? 0 : 1),
    })),
  setHasFetched: (fetched) => set({ hasFetched: fetched }),
}))

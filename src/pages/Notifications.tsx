import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useNotificationStore } from '@/stores/notificationStore'
import { staggerContainer, staggerItem } from '@/components/ui/motion'
import { Bell, BellOff } from 'lucide-react'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { notifications } = useNotificationStore()

  return (
    <motion.div
      className="p-4"
      data-testid="notifications-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {notifications.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-12 text-center" variants={staggerItem}>
          <BellOff className="w-12 h-12 text-text-tertiary mb-3" />
          <p className="text-sm text-text-tertiary">
            {t('notifications:no_notifications')}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              variants={staggerItem}
              className={`rounded-xl border p-3 ${
                !n.is_read
                  ? 'bg-brand-primary/5 border-brand-primary/20'
                  : 'bg-bg-tertiary border-border-subtle'
              }`}
              data-testid="notification-item"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${
                  !n.is_read ? 'bg-brand-primary/10' : 'bg-bg-hover'
                }`}>
                  <Bell className={`w-4 h-4 ${!n.is_read ? 'text-brand-primary' : 'text-text-tertiary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{n.body}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="h-2 w-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useFriends, useFriendRequests, useAcceptFriendRequest } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { staggerContainer, staggerItem } from '@/components/ui/motion'
import { UserPlus, Users } from 'lucide-react'

export default function FriendsListPage() {
  const { t } = useTranslation()
  const { data: friends, isLoading } = useFriends()
  const { data: requests } = useFriendRequests()
  const acceptRequest = useAcceptFriendRequest()

  return (
    <motion.div
      className="p-4 space-y-6"
      data-testid="friends-list-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {requests && requests.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-text-primary">{t('social:friend_requests')}</h3>
          </div>
          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-xl bg-bg-tertiary border border-border-subtle p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{req.from_user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-text-primary">{req.from_user.name}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => acceptRequest.mutate({ request_id: req.id })}
                  disabled={acceptRequest.isPending}
                  data-testid={`accept-request-${req.id}`}
                >
                  {t('social:accept')}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-text-primary">
            {t('social:friends_list')} ({friends?.length ?? 0})
          </h3>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        ) : friends && friends.length > 0 ? (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between rounded-xl bg-bg-tertiary border border-border-subtle p-3 hover:bg-bg-hover transition-colors"
                data-testid="friend-item"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{friend.friend_user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium text-text-primary">{friend.friend_user.name}</span>
                    <div className="flex items-center gap-1">
                      <span className={`h-2 w-2 rounded-full ${friend.friend_user.is_online ? 'bg-semantic-success' : 'bg-text-tertiary'}`} />
                      <span className="text-xs text-text-tertiary">
                        {friend.friend_user.is_online ? t('social:online') : t('social:offline')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary text-center py-4">
            {t('social:no_friends')}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

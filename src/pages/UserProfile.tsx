import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { useUserProfile } from '@/lib/api'
import { motion } from 'motion/react'
import { ArrowRight, Clock, Trophy, Users, Award, Film } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'
import { StatsCard } from '@/components/profile/ProfileHeader'

export default function UserProfilePage() {
  const { t } = useTranslation()
  const { userId } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUserProfile(userId ?? '')

  const watchTime = user?.total_watch_time
    ? `${Math.round(user.total_watch_time / 3600)}h`
    : '0h'

  return (
    <motion.div
      className="p-4 space-y-4"
      data-testid="user-profile-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <button onClick={() => navigate(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-full glass text-text-secondary hover:text-brand-primary transition-colors cursor-pointer">
        <ArrowRight className="w-4 h-4" />
      </button>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="h-20 w-20 rounded-full bg-bg-tertiary mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-32 bg-bg-tertiary mx-auto animate-pulse" />
        </div>
      ) : !user ? (
        <div className="text-center py-12">
          <p className="text-sm text-text-tertiary">{t('profile:not_found', { defaultValue: 'المستخدم غير موجود' })}</p>
        </div>
      ) : (
        <>
          <motion.div variants={staggerItem} className="text-center">
            <div className="h-20 w-20 rounded-full bg-bg-tertiary mx-auto mb-3 overflow-hidden border-2 border-border-subtle">
              {user.photo_url ? (
                <img src={user.photo_url} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-text-tertiary">
                  {user.first_name?.charAt(0) ?? '?'}
                </div>
              )}
            </div>
            <h2 className="text-base font-bold text-text-primary">
              {user.first_name} {user.last_name ?? ''}
            </h2>
            {user.username && (
              <p className="text-xs text-text-tertiary mt-0.5">@{user.username}</p>
            )}
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-3" variants={staggerItem}>
            <StatsCard
              label={t('profile:watch_time')}
              value={watchTime}
              icon={<Clock className="w-6 h-6 text-text-tertiary" />}
            />
            <StatsCard
              label={t('profile:watch_count')}
              value={String(user.stats?.watch_count ?? 0)}
              icon={<Film className="w-6 h-6 text-text-tertiary" />}
            />
            <StatsCard
              label={t('profile:friends_count', { defaultValue: 'الأصدقاء' })}
              value={String(user.stats?.friends_count ?? 0)}
              icon={<Users className="w-6 h-6 text-text-tertiary" />}
            />
            <StatsCard
              label={t('profile:badges', { defaultValue: 'الشارات' })}
              value={String(user.stats?.badges_count ?? 0)}
              icon={<Award className="w-6 h-6 text-text-tertiary" />}
            />
          </motion.div>

          {user.points > 0 && (
            <motion.div variants={staggerItem}
              className="flex items-center gap-2 rounded-xl bg-bg-tertiary border border-border-subtle p-3"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-text-primary">
                {user.points} {t('leaderboard:points', { defaultValue: 'نقطة' })}
              </span>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
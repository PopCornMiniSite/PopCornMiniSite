import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ProfileHeader, StatsCard } from '@/components/profile/ProfileHeader'
import { useCurrentUser } from '@/lib/api'
import { useWallet } from '@/lib/api'
import { useTelegram } from '@/providers/TelegramProvider'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Clock, PartyPopper, Star, Award, Settings, History, Trophy, BarChart3, Sparkles, Film } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'

export default function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { initDataRaw } = useTelegram()
  const { data: user, isLoading } = useCurrentUser(initDataRaw || null)
  const { data: wallet } = useWallet()

  const watchTime = user?.total_watch_time
    ? `${Math.round(user.total_watch_time / 3600)}h`
    : '0h'

  return (
    <motion.div
      className="p-4 space-y-6"
      data-testid="profile-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 w-20 rounded-full bg-bg-tertiary mx-auto animate-pulse" />
          <div className="h-6 w-32 bg-bg-tertiary mx-auto animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <motion.div variants={staggerItem}>
            <ProfileHeader
              user={user}
              stats={{
                total_watch_time: user?.total_watch_time ?? 0,
                movies_watched: (user as any)?.stats?.watch_count ?? 0,
                series_completed: (user as any)?.series_completed ?? 0,
                friends_count: user?.friends_count ?? 0,
                rank_position: 0,
              }}
            />
          </motion.div>

          <motion.div className="grid grid-cols-2 gap-3" variants={staggerItem}>
            <StatsCard label={t('profile:watch_time')} value={watchTime} icon={<Clock className="w-6 h-6 text-text-tertiary" />} />
            <StatsCard label={t('profile:parties')} value={String((user?.parties_hosted ?? 0) + (user?.parties_joined ?? 0))} icon={<PartyPopper className="w-6 h-6 text-text-tertiary" />} />
            <StatsCard label={t('profile:stars')} value={String(wallet?.stars_balance ?? user?.stars_balance ?? 0)} icon={<Star className="w-6 h-6 text-text-tertiary" />} />
            <StatsCard label={t('profile:watch_count')} value={String((user as any)?.stats?.watch_count ?? 0)} icon={<Film className="w-6 h-6 text-text-tertiary" />} />
          </motion.div>

          {user?.badges && user.badges.length > 0 && (
            <motion.div variants={staggerItem}>
              <Separator />
              <div className="flex items-center gap-1.5 mt-2">
                <Award className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-medium text-text-secondary">{t('profile:badges_count', { count: user.badges.length })}</span>
              </div>
            </motion.div>
          )}

          <motion.div variants={staggerItem}>
            <Separator />
          </motion.div>

          <motion.div className="space-y-2" variants={staggerItem}>
            <Button variant="ghost" className="w-full justify-start" iconLeft={<Sparkles className="w-4 h-4" />} onClick={() => navigate('/my-list')}>
              {t('my_list', { defaultValue: 'قائمتي' })}
            </Button>
            <Button variant="ghost" className="w-full justify-start" iconLeft={<History className="w-4 h-4" />} onClick={() => navigate('/history')}>
              {t('profile:watch_history')}
            </Button>
            <Button variant="ghost" className="w-full justify-start" iconLeft={<Trophy className="w-4 h-4" />} onClick={() => navigate('/achievements')}>
              {t('profile:achievements')}
            </Button>
            <Button variant="ghost" className="w-full justify-start" iconLeft={<BarChart3 className="w-4 h-4" />} onClick={() => navigate('/leaderboard')}>
              {t('profile:leaderboard')}
            </Button>
            <Separator />
            <Button variant="ghost" className="w-full justify-start" iconLeft={<Settings className="w-4 h-4" />} onClick={() => navigate('/settings')}>
              {t('settings:title')}
            </Button>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
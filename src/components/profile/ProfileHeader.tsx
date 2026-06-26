import { useTranslation } from 'react-i18next'
import type { User, UserStats, UserBadge } from '@/types/user'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Award } from 'lucide-react'

interface ProfileHeaderProps {
  user?: User
  stats?: UserStats
  isOwnProfile?: boolean
}

export function ProfileHeader({ user, stats }: ProfileHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-4 p-4" data-testid="profile-header">
      <Avatar className="h-20 w-20">
        <AvatarFallback className="text-2xl">
          {user?.first_name?.charAt(0) ?? '?'}
        </AvatarFallback>
      </Avatar>

      <div className="text-center">
        <h2 className="text-xl font-bold">
          {user?.first_name} {user?.last_name}
        </h2>
        {user?.username && (
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        )}
        {user?.is_premium && (
          <Badge variant="secondary" className="mt-1">
            <Star className="w-4 h-4 fill-current inline" /> {t('profile:premium')}
          </Badge>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-4 gap-4 w-full max-w-sm">
          <div className="text-center">
            <p className="text-lg font-bold">{stats.movies_watched}</p>
            <p className="text-xs text-muted-foreground">{t('profile:movies')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{stats.series_completed}</p>
            <p className="text-xs text-muted-foreground">{t('profile:series')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{stats.friends_count}</p>
            <p className="text-xs text-muted-foreground">{t('profile:friends')}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">#{stats.rank_position}</p>
            <p className="text-xs text-muted-foreground">{t('profile:rank')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

interface BadgeDisplayProps {
  badges?: UserBadge[]
}

export function BadgeDisplay({ badges = [] }: BadgeDisplayProps) {
  const { t } = useTranslation()

  if (badges.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-4" data-testid="badge-display-empty">
        {t('profile:no_badges')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3" data-testid="badge-display">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center gap-1 rounded-lg border border-border p-3"
        >
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-xl">
            <Award className="w-4 h-4 inline" />
          </div>
          <span className="text-xs font-medium text-center">{badge.name}</span>
          <Badge variant={badge.rarity as 'common' | 'rare' | 'epic' | 'legendary'} className="text-[10px]">
            {badge.rarity}
          </Badge>
        </div>
      ))}
    </div>
  )
}

interface StatsCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3" data-testid="stats-card">
      {icon && <span className="text-2xl">{icon}</span>}
      <div>
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

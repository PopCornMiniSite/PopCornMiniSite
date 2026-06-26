import { useTranslation } from 'react-i18next'
import { useLeaderboard } from '@/lib/api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useTelegram } from '@/providers/TelegramProvider'

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const [period, setPeriod] = useState('all')
  const { data: leaderboard, isLoading } = useLeaderboard(period)
  const { user } = useTelegram()
  const currentUserId = user?.id ?? 0

  return (
    <div className="p-4 space-y-4" data-testid="leaderboard-page">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['daily', 'weekly', 'monthly', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === p
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t(`leaderboard:${p}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.user_id}
              className={`flex items-center gap-3 rounded-lg border border-border p-3 ${
                entry.user_id === currentUserId ? 'border-primary bg-primary/5' : ''
              }`}
              data-testid="leaderboard-entry"
            >
              <span className="text-lg font-bold w-8 text-center">
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <Avatar className="h-10 w-10">
                <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <span className="text-sm font-medium">{entry.name}</span>
                <p className="text-xs text-muted-foreground">
                  {entry.score.toLocaleString()} {t('leaderboard:points')}
                </p>
              </div>
              {entry.user_id === 5703679073 && (
                <Badge variant="secondary">{t('profile:you')}</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('leaderboard:no_entries')}
        </p>
      )}
    </div>
  )
}

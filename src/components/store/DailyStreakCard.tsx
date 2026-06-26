import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useDailyStreak, useClaimDailyStreak } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Zap, Gift, Check } from 'lucide-react'

const STREAK_REWARDS = [
  { day: 1, reward: 10 },
  { day: 2, reward: 20 },
  { day: 3, reward: 30 },
  { day: 4, reward: 40 },
  { day: 5, reward: 50 },
  { day: 6, reward: 60 },
  { day: 7, reward: 100 },
]

export function DailyStreakCard() {
  const { t } = useTranslation('store')
  const { data: streak, isLoading } = useDailyStreak()
  const claimMutation = useClaimDailyStreak()

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-tertiary/50 p-4 animate-pulse">
        <div className="h-4 w-32 bg-bg-hover rounded mb-3" />
        <div className="flex gap-1.5">{Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-8 flex-1 bg-bg-hover rounded-lg" />)}</div>
      </div>
    )
  }

  if (!streak) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-bg-tertiary/50 overflow-hidden"
      data-testid="daily-streak-card"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-brand-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary font-display">{t('earning.daily_streak')}</h4>
              <p className="text-[11px] text-text-tertiary">{t('earning.daily_streak_desc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold">
            <Zap className="w-3 h-3" />
            {streak.current_streak}
          </div>
        </div>

        <div className="flex gap-1.5 mb-3">
          {STREAK_REWARDS.map((sr) => {
            const isCompleted = streak.current_streak >= sr.day
            const isToday = streak.current_streak + 1 === sr.day && !streak.today_claimed
            return (
              <div
                key={sr.day}
                className={`flex-1 rounded-lg py-2 text-center text-[10px] font-medium border transition-all ${
                  isCompleted
                    ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary'
                    : isToday
                      ? 'bg-brand-secondary/10 border-brand-secondary/30 text-brand-secondary animate-pulse'
                      : 'bg-bg-primary/40 border-border-subtle text-text-tertiary'
                }`}
                data-testid={`streak-day-${sr.day}`}
              >
                <div className="font-semibold">{sr.day}</div>
                <div className="opacity-70">+{sr.reward}</div>
              </div>
            )
          })}
        </div>

        <Button
          variant={streak.today_claimed ? 'secondary' : 'primary'}
          size="sm"
          className="w-full"
          disabled={streak.today_claimed || claimMutation.isPending}
          onClick={() => claimMutation.mutate()}
          loading={claimMutation.isPending}
          iconLeft={streak.today_claimed ? <Check className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
          data-testid="claim-streak-button"
        >
          {streak.today_claimed ? t('earning.claimed') : t('earning.claim')}
        </Button>
      </div>
    </motion.div>
  )
}

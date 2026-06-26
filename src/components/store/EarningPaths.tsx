import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useEarningHistory } from '@/lib/api'
import { CalendarCheck, Eye, Users, MessageSquare, Heart, PartyPopper } from 'lucide-react'
import type { EarningPath } from '@/types/wallet'

const PATH_CONFIG: Record<EarningPath, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  daily_streak: { icon: CalendarCheck, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
  watch_to_earn: { icon: Eye, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
  social: { icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  purchase_bonus: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  referral: { icon: PartyPopper, color: 'text-amber-400', bg: 'bg-amber-400/10' },
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  review: MessageSquare,
  like: Heart,
  party: PartyPopper,
}

export function EarningPaths() {
  const { t } = useTranslation('store')
  const { data: earnings, isLoading } = useEarningHistory()

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 bg-bg-tertiary rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
      data-testid="earning-paths"
    >
      <h3 className="text-sm font-semibold text-text-primary font-display">{t('earning.recent_activity')}</h3>

      <div className="space-y-1.5">
        {earnings?.slice(0, 8).map((entry, i) => {
          const config = PATH_CONFIG[entry.path] ?? PATH_CONFIG.social
          const Icon = config.icon
          const socialKey = entry.description.toLowerCase().includes('review') ? 'review'
            : entry.description.toLowerCase().includes('like') ? 'like'
              : entry.description.toLowerCase().includes('party') ? 'party' : null
          const SocialIcon = socialKey ? SOCIAL_ICONS[socialKey] ?? Icon : Icon

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl bg-bg-tertiary/50 border border-border-subtle px-3 py-2.5"
            >
              <div className={`h-8 w-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <SocialIcon className={`w-4 h-4 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-primary truncate">{entry.description}</p>
                <p className="text-[10px] text-text-tertiary">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs font-semibold text-brand-primary tabular-nums shrink-0">
                +{entry.amount}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

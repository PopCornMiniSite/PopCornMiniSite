import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useAchievements } from '@/lib/api'
import { Progress } from '@/components/ui/progress'
import { Trophy, Lock } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'

export default function AchievementsPage() {
  const { t } = useTranslation()
  const { data: achievements, isLoading } = useAchievements()

  return (
    <motion.div
      className="p-4 space-y-4"
      data-testid="achievements-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : achievements && achievements.length > 0 ? (
        achievements.map((ach) => (
          <motion.div
            key={ach.id}
            variants={staggerItem}
            className={`rounded-xl border p-4 ${
              ach.is_unlocked
                ? 'bg-brand-primary/5 border-brand-primary/20'
                : 'bg-bg-tertiary border-border-subtle'
            }`}
            data-testid="achievement-item"
          >
            <div className="flex items-start gap-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                ach.is_unlocked ? 'bg-brand-primary/10' : 'bg-bg-hover'
              }`}>
                {ach.is_unlocked
                  ? <Trophy className="h-6 w-6 text-brand-primary" />
                  : <Lock className="h-6 w-6 text-text-tertiary" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary">{ach.name}</h3>
                <p className="text-xs text-text-tertiary">{ach.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={(ach.progress / ach.total) * 100} className="h-2 flex-1" />
                  <span className="text-xs text-text-tertiary">
                    {ach.progress}/{ach.total}
                  </span>
                </div>
              </div>
              {ach.is_unlocked && ach.unlocked_at && (
                <span className="text-xs text-text-tertiary shrink-0">
                  {new Date(ach.unlocked_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div className="flex flex-col items-center justify-center py-12 text-center" variants={staggerItem}>
          <Trophy className="w-12 h-12 text-text-tertiary mb-3" />
          <p className="text-sm text-text-tertiary">
            {t('profile:no_achievements')}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

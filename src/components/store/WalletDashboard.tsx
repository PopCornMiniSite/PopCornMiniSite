import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useWallet } from '@/lib/api'
import { Star, Popcorn, TrendingUp, TrendingDown } from 'lucide-react'

export function WalletDashboard() {
  const { t } = useTranslation('store')
  const { data: wallet, isLoading } = useWallet()

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border-subtle bg-bg-tertiary/50 backdrop-blur-md p-5 animate-pulse">
        <div className="h-4 w-24 bg-bg-hover rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-16 flex-1 bg-bg-hover rounded-xl" />
          <div className="h-16 flex-1 bg-bg-hover rounded-xl" />
        </div>
      </div>
    )
  }

  if (!wallet) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-border-subtle bg-bg-tertiary/50 backdrop-blur-md overflow-hidden"
      data-testid="wallet-dashboard"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary opacity-60" />

      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-primary opacity-[0.04] blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-brand-secondary opacity-[0.04] blur-[40px] pointer-events-none" />

      <div className="relative p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">
          {t('wallet.title')}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-bg-primary/60 border border-border-subtle p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
              </div>
              <span className="text-[11px] font-medium text-text-tertiary">{t('wallet.stars')}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-display tabular-nums">
              {wallet.stars_balance}
            </p>
          </div>

          <div className="rounded-xl bg-bg-primary/60 border border-border-subtle p-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Popcorn className="w-4 h-4 text-brand-primary" />
              </div>
              <span className="text-[11px] font-medium text-text-tertiary">{t('wallet.kernels')}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary font-display tabular-nums">
              {wallet.kernels_balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <TrendingUp className="w-3.5 h-3.5 text-brand-secondary" />
            <span>{t('wallet.total_earned')}: {wallet.total_earned_kernels.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <TrendingDown className="w-3.5 h-3.5 text-semantic-error" />
            <span>{t('wallet.total_spent')}: {wallet.total_spent_kernels.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

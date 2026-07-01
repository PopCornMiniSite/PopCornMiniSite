import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import type { Product } from '@/types/product'
import type { PurchaseCurrency } from '@/types/wallet'
import { useHybridPurchase, useWallet } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { RarityBadge } from './RarityBadge'
import { AssetPreview } from './AssetPreview'
import { Star, Popcorn, Check, X, Shield, ArrowRight, Wallet } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSheetProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PaymentSheet({ product, open, onClose, onSuccess }: PaymentSheetProps) {
  const { t } = useTranslation('store')
  const hybridPurchase = useHybridPurchase()
  const { data: wallet } = useWallet()
  const [selectedCurrency, setSelectedCurrency] = useState<PurchaseCurrency>('kernels')
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')

  if (!product) return null

  const kernelsPrice = product.price_kernels ?? 0
  const starsPrice = product.price_stars
  const isKernelsOnly = product.payment_method === 'kernels'
  const isStarsOnly = product.payment_method === 'stars'
  const isBoth = product.payment_method === 'both'

  const effectiveCurrency = isKernelsOnly ? 'kernels' : isStarsOnly ? 'stars' : selectedCurrency
  const effectivePrice = effectiveCurrency === 'kernels' ? kernelsPrice : starsPrice
  const currentBalance = effectiveCurrency === 'kernels' ? (wallet?.kernels_balance ?? 0) : (wallet?.stars_balance ?? 0)
  const canAfford = currentBalance >= effectivePrice

  const handlePay = async () => {
    setStatus('processing')
    const idempotencyKey = `${product.id}-${Date.now()}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 10)}`

    try {
      const result = await hybridPurchase.mutateAsync({
        product_id: product.id,
        currency: effectiveCurrency,
        idempotency_key: idempotencyKey,
      })

      const invoiceLink = result.data.invoice_link

      if (effectiveCurrency === 'stars' && invoiceLink && typeof window !== 'undefined' && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceLink, (invoiceStatus: string) => {
          if (invoiceStatus === 'paid') {
            setStatus('success')
            toast.success(t('purchase_success'))
            onSuccess?.()
            setTimeout(onClose, 1800)
          } else {
            setStatus('idle')
          }
        })
      } else if (effectiveCurrency === 'stars' && invoiceLink) {
        window.open(invoiceLink, '_blank')
        setStatus('idle')
      } else {
        setStatus('success')
        toast.success(t('purchase_success'))
        onSuccess?.()
        setTimeout(onClose, 1800)
      }
    } catch {
      setStatus('error')
      toast.error(t('payment_error'))
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  const handleClose = () => {
    if (status === 'processing') return
    setStatus('idle')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-bg-secondary border-border-subtle" data-testid="payment-sheet">
        <DialogHeader>
          <DialogTitle className="font-display text-text-primary">{t('payment_title')}</DialogTitle>
          <DialogDescription className="text-text-tertiary">{t('payment_description')}</DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center py-8 space-y-4"
            >
              <motion.div
                className="h-16 w-16 rounded-full bg-semantic-success/20 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Check className="w-8 h-8 text-semantic-success" />
              </motion.div>
              <p className="text-lg font-semibold text-text-primary font-display">{t('success')}</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 rounded-xl bg-bg-tertiary border border-border-subtle p-4">
                <AssetPreview
                  type={product.category}
                  rarity={product.rarity}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-primary font-display truncate">{product.name}</h3>
                  <p className="text-sm text-text-tertiary line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RarityBadge rarity={product.rarity} />
                    <span className="text-xs text-text-tertiary">
                      {product.assets.length} {t('included_items')}
                    </span>
                  </div>
                </div>
              </div>

              {isBoth && (
                <>
                  <Separator className="bg-border-subtle" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-text-secondary">{t('payment_description')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedCurrency('kernels')}
                        className={`flex items-center gap-2 rounded-xl p-3 border transition-all ${
                          effectiveCurrency === 'kernels'
                            ? 'border-brand-primary bg-brand-primary/5 shadow-[0_0_12px_rgba(255,107,53,0.15)]'
                            : 'border-border-subtle bg-bg-tertiary/50 hover:border-border-default'
                        }`}
                        data-testid="pay-kernels-option"
                      >
                        <Popcorn className="w-5 h-5 text-brand-primary" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-text-primary">{kernelsPrice.toLocaleString()}</p>
                          <p className="text-[10px] text-text-tertiary">{t('wallet.kernels')}</p>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedCurrency('stars')}
                        className={`flex items-center gap-2 rounded-xl p-3 border transition-all ${
                          effectiveCurrency === 'stars'
                            ? 'border-blue-400 bg-blue-400/5 shadow-[0_0_12px_rgba(96,165,250,0.15)]'
                            : 'border-border-subtle bg-bg-tertiary/50 hover:border-border-default'
                        }`}
                        data-testid="pay-stars-option"
                      >
                        <Star className="w-5 h-5 fill-blue-400 text-blue-400" />
                        <div className="text-left">
                          <p className="text-sm font-semibold text-text-primary">{starsPrice}</p>
                          <p className="text-[10px] text-text-tertiary">{t('wallet.stars')}</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Separator className="bg-border-subtle" />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{t('store:total')}</span>
                  <div className="flex items-center gap-1.5">
                    {effectiveCurrency === 'kernels' ? (
                      <Popcorn className="w-5 h-5 text-brand-primary" />
                    ) : (
                      <Star className="w-5 h-5 fill-blue-400 text-blue-400" />
                    )}
                    <span className="text-xl font-bold text-text-primary font-display">
                      {effectivePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-text-tertiary">
                  <span>{t('wallet.title')}</span>
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{currentBalance.toLocaleString()}</span>
                  </div>
                </div>

                {!canAfford && (
                  <p className="text-xs text-semantic-error text-center">
                    {effectiveCurrency === 'kernels' ? t('insufficient_kernels') : t('insufficient_stars')}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-primary/5 border border-brand-primary/20">
                <Shield className="w-4 h-4 text-brand-primary shrink-0" />
                <span className="text-xs text-text-secondary">
                  {effectiveCurrency === 'kernels'
                    ? t('confirm_kernels_purchase')
                    : t('confirm_stars_purchase')}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={status === 'processing'}
                  iconLeft={<X className="w-4 h-4" />}
                >
                  {t('common:cancel', 'Cancel')}
                </Button>
                <Button
                  variant={effectiveCurrency === 'kernels' ? 'primary' : 'premium'}
                  className="flex-1"
                  onClick={handlePay}
                  disabled={status === 'processing' || !canAfford}
                  loading={status === 'processing'}
                  iconLeft={effectiveCurrency === 'kernels' ? <Popcorn className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                  iconRight={status === 'idle' ? <ArrowRight className="w-4 h-4" /> : undefined}
                  data-testid="pay-button"
                >
                  {t('pay_now')}
                </Button>
              </div>

              {status === 'error' && (
                <p className="text-sm text-semantic-error text-center">{t('payment_error')}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { usePurchases } from '@/lib/api'
import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { ArrowRight, Package } from 'lucide-react'

export default function PurchasesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: purchases, isLoading } = usePurchases()

  return (
    <div data-testid="purchases-page">
      <Header />
      <motion.div
        className="p-4 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full glass text-text-secondary hover:text-brand-primary transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold font-display text-text-primary tracking-tight">
            {t('store:purchases', { defaultValue: 'المشتريات' })}
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        ) : !purchases || purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-bg-tertiary border border-border-subtle flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-text-tertiary" />
            </div>
            <p className="text-sm text-text-tertiary">{t('store:no_purchases')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((p: any) => (
              <div key={p.id}
                className="flex items-center gap-3 rounded-xl bg-bg-tertiary border border-border-subtle p-3"
              >
                {p.image_url && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-bg-hover flex-shrink-0 border border-border-subtle">
                    <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {p.name_ar || p.name_en || `#${p.product_id}`}
                  </p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">
                    {p.price_stars ? `${p.price_stars} ⭐` : ''}
                    {p.purchased_at && (
                      <span className="mr-2">{new Date(p.purchased_at).toLocaleDateString('ar-EG')}</span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                  {p.status === 'completed' ? t('store:completed', { defaultValue: 'مكتمل' }) : p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
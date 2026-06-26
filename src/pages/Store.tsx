import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Header } from '@/components/layout/Header'
import { ProductGrid } from '@/components/store/ProductGrid'
import { CategoryTabs } from '@/components/store/CategoryTabs'
import { PaymentSheet } from '@/components/store/PaymentSheet'
import { WalletDashboard } from '@/components/store/WalletDashboard'
import { DailyStreakCard } from '@/components/store/DailyStreakCard'
import { EarningPaths } from '@/components/store/EarningPaths'
import { useStoreProducts } from '@/lib/api'
import type { Product } from '@/types/product'
import { ShoppingBag, Star, Popcorn, TrendingUp, Info } from 'lucide-react'
import { staggerContainer } from '@/components/ui/motion'

export default function StorePage() {
  const { t } = useTranslation('store')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showEarningPanel, setShowEarningPanel] = useState(false)

  const { data: products, isLoading } = useStoreProducts()

  const handleBuy = (product: Product) => {
    setSelectedProduct(product)
    setSheetOpen(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      data-testid="store-page"
    >
      <Header />

      <div className="relative pb-24">
        <section className="relative h-[280px] sm:h-[360px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-primary opacity-5 blur-[150px] pointer-events-none" />
          <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-brand-secondary opacity-5 blur-[100px] pointer-events-none" />

          <div className="relative h-full flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto text-center space-y-4"
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary" />
                </span>
                {t('new_collection')}
              </motion.div>

              <motion.h1
                className="font-display font-bold text-4xl sm:text-5xl leading-tight tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {t('hero_title')}
                <br />
                <span className="gradient-text">{t('hero_subtitle')}</span>
              </motion.h1>

              <motion.p
                className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {t('hero_description')}
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-4 text-sm text-text-tertiary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-brand-primary" />
                  {products?.length ?? 0} {t('items')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                  {t('star_payments')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Popcorn className="w-4 h-4 text-brand-primary" />
                  {t('kernels_payments')}
                </span>
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-secondary" />
                  {t('exclusive')}
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <div className="px-4 space-y-4 -mt-8 relative z-10">
          <WalletDashboard />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEarningPanel(!showEarningPanel)}
              className="flex items-center gap-2 text-sm text-brand-primary hover:text-brand-primary-hover transition-colors font-medium"
              data-testid="toggle-earning-panel"
            >
              <TrendingUp className="w-4 h-4" />
              {t('earning.title')}
              <Info className="w-3.5 h-3.5 text-text-tertiary" />
            </button>
          </div>

          {showEarningPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <DailyStreakCard />
              <EarningPaths />
            </motion.div>
          )}
        </div>

        <motion.section
          className="px-4 mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <CategoryTabs />
        </motion.section>

        <motion.section
          className="px-4 mt-4"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <ProductGrid
            products={products}
            isLoading={isLoading}
            onBuy={handleBuy}
          />
        </motion.section>

        <PaymentSheet
          product={selectedProduct}
          open={sheetOpen}
          onClose={() => {
            setSheetOpen(false)
            setSelectedProduct(null)
          }}
          onSuccess={() => {
            setSheetOpen(false)
            setSelectedProduct(null)
          }}
        />
      </div>
    </motion.div>
  )
}

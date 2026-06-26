import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { Product, ProductCategory } from '@/types/product'
import { RarityBadge } from './RarityBadge'
import { AssetPreview } from './AssetPreview'
import { Button } from '@/components/ui/button'
import { Star, Popcorn, Paintbrush, Award, Frame, Image, SmilePlus, Sparkles, Globe, Package } from 'lucide-react'

const categoryIcons: Record<ProductCategory, React.ComponentType<{ className?: string }>> = {
  theme: Paintbrush,
  badge: Award,
  frame: Frame,
  wallpaper: Image,
  emoji_pack: SmilePlus,
  icon: Sparkles,
  background: Globe,
  asset_pack: Package,
}

interface ProductCardProps {
  product: Product
  userKernels?: number
  userStars?: number
  onBuy?: (product: Product) => void
}

function PaymentMethodBadge({ method }: { method: Product['payment_method'] }) {
  const { t } = useTranslation('store')

  if (method === 'kernels') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
        <Popcorn className="w-2.5 h-2.5" />
        {t('store:kernels.balance')}
      </span>
    )
  }

  if (method === 'stars') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Star className="w-2.5 h-2.5 fill-blue-400" />
        Stars
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
      <Star className="w-2 h-2 fill-purple-400" />
      /
      <Popcorn className="w-2 h-2" />
    </span>
  )
}

export function ProductCard({ product, userKernels = 0, userStars = 0, onBuy }: ProductCardProps) {
  const { t } = useTranslation()
  const Icon = categoryIcons[product.category]

  const canAffordKernels = product.price_kernels != null && userKernels >= product.price_kernels
  const canAffordStars = userStars >= product.price_stars
  const canAfford = product.payment_method === 'kernels' ? canAffordKernels
    : product.payment_method === 'stars' ? canAffordStars
      : canAffordKernels || canAffordStars

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-xl overflow-hidden bg-bg-tertiary border border-border-subtle card-glow hover:border-brand-primary/30 transition-all duration-300 hover:shadow-[0_0_32px_rgba(255,107,53,0.12)]"
      data-testid="product-card"
    >
      <div className="aspect-square bg-bg-hover relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <AssetPreview
              type={product.category}
              rarity={product.rarity}
              size="lg"
              className="bg-transparent"
            />
          </div>
        )}

        <div className="absolute top-2 right-2">
          <RarityBadge rarity={product.rarity} />
        </div>

        {product.is_limited && product.max_quantity && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold glass text-brand-primary border border-brand-primary/30">
              {product.sold_count}/{product.max_quantity} {t('store:sold')}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold line-clamp-1 text-text-primary group-hover:text-brand-primary transition-colors font-display">
            {product.name}
          </h3>
        </div>

        <p className="text-xs text-text-tertiary line-clamp-2">
          {product.description}
        </p>

        {product.assets.length > 0 && (
          <div className="flex gap-1.5">
            {product.assets.slice(0, 3).map((asset) => (
              <div
                key={asset.id}
                className="h-6 w-6 rounded-md bg-bg-hover border border-border-subtle flex items-center justify-center"
              >
                <Icon className="w-3 h-3 text-text-tertiary" />
              </div>
            ))}
            {product.assets.length > 3 && (
              <span className="text-[10px] text-text-tertiary self-center">+{product.assets.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex flex-col gap-1">
            <PaymentMethodBadge method={product.payment_method} />
            <div className="flex items-baseline gap-1.5">
              {product.payment_method !== 'kernels' && product.price_stars > 0 && (
                <div className="flex items-baseline gap-1">
                  <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                  <span className="text-sm font-bold text-blue-400 font-display tabular-nums">
                    {product.price_stars}
                  </span>
                  {product.original_price_stars && product.original_price_stars > product.price_stars && (
                    <span className="text-[10px] text-text-tertiary line-through">
                      {product.original_price_stars}
                    </span>
                  )}
                </div>
              )}
              {product.payment_method === 'both' && product.price_kernels != null && (
                <span className="text-[10px] text-text-tertiary">{t('store:or')}</span>
              )}
              {product.payment_method !== 'stars' && product.price_kernels != null && (
                <div className="flex items-baseline gap-1">
                  <Popcorn className="w-3 h-3 text-brand-primary" />
                  <span className="text-sm font-bold text-brand-primary font-display tabular-nums">
                    {product.price_kernels.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {onBuy && (
            <Button
              size="sm"
              variant={product.is_purchased ? 'secondary' : canAfford ? 'primary' : 'outline'}
              onClick={() => onBuy(product)}
              disabled={!product.is_purchasable || product.is_purchased || !canAfford}
              className={!canAfford && !product.is_purchased ? 'opacity-50' : ''}
              data-testid={`buy-button-${product.id}`}
            >
              {product.is_purchased ? t('store:owned') : t('store:buy')}
            </Button>
          )}
        </div>
      </div>

      {product.is_purchased && (
        <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm flex items-center justify-center z-10">
          <span className="px-4 py-2 rounded-xl bg-brand-primary/90 text-white text-sm font-semibold shadow-[0_4px_16px_rgba(255,107,53,0.4)]">
            {t('store:owned')}
          </span>
        </div>
      )}
    </motion.article>
  )
}

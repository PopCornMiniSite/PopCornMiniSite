import { useTranslation } from 'react-i18next'
import type { Product } from '@/types/product'
import { BuyButton } from './BuyButton'
import { RarityBadge } from './RarityBadge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Star, Paintbrush } from 'lucide-react'

interface ProductDetailProps {
  product: Product
  onBuySuccess?: () => void
  onClose?: () => void
}

export function ProductDetail({ product, onBuySuccess, onClose }: ProductDetailProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-6" data-testid="product-detail">
      <div className="aspect-video rounded-xl overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl text-muted-foreground">
            <Paintbrush className="w-8 h-8 text-text-tertiary" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
          <RarityBadge rarity={product.rarity} />
        </div>

        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {product.assets.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold mb-2">{t('store:included_items')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.assets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-lg border border-border p-2 text-xs"
                >
                  <span className="font-medium">{asset.name}</span>
                  <span className="ml-1 text-muted-foreground">({asset.type})</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-primary"><Star className="w-5 h-5 fill-brand-primary text-brand-primary inline" /> {product.price_stars}</span>
          {product.original_price_stars && (
            <span className="ml-2 text-sm text-muted-foreground line-through">
              {product.original_price_stars}
            </span>
          )}
        </div>
        <BuyButton product={product} size="lg" onSuccess={onBuySuccess} />
      </div>

      {onClose && (
        <Button variant="ghost" className="w-full" onClick={onClose}>
          {t('common:close')}
        </Button>
      )}
    </div>
  )
}

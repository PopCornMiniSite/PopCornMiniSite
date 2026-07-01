import { useTranslation } from 'react-i18next'
import { useCreateInvoice } from '@/lib/api'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/product'
import { Star } from 'lucide-react'

interface BuyButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'lg' | 'icon' | 'md'
  className?: string
  onSuccess?: () => void
}

export function BuyButton({ product, variant = 'primary', size = 'md', className, onSuccess }: BuyButtonProps) {
  const { t } = useTranslation()
  const createInvoice = useCreateInvoice()

  const handleBuy = async () => {
    const idempotencyKey = `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`

    try {
      const result = await createInvoice.mutateAsync({
        product_id: product.id,
        idempotency_key: idempotencyKey,
      })

      if (result.data.invoice_link && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(result.data.invoice_link, (status: string) => {
          if (status === 'paid') {
            onSuccess?.()
          }
        })
      } else if (result.data.invoice_link) {
        window.open(result.data.invoice_link, '_blank')
      } else {
        onSuccess?.()
      }
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleBuy}
      disabled={createInvoice.isPending || !product.is_purchasable}
      data-testid="buy-button"
    >
      {createInvoice.isPending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t('store:processing')}
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Star className="w-4 h-4 fill-current inline" /> {product.price_stars} {t('store:buy')}
        </span>
      )}
    </Button>
  )
}

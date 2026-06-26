import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { ProductDetail } from '@/components/store/ProductDetail'
import { PaymentSheet } from '@/components/store/PaymentSheet'
import { useProductDetail } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProductDetail(productId ?? '')
  const [sheetOpen, setSheetOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('store:not_found')}
      </div>
    )
  }

  return (
    <div className="p-4" data-testid="product-detail-page">
      <ProductDetail
        product={product}
        onBuySuccess={() => setSheetOpen(true)}
        onClose={() => navigate(-1)}
      />

      <PaymentSheet
        product={product}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSuccess={() => {
          setSheetOpen(false)
          navigate('/assets')
        }}
      />
    </div>
  )
}

import type { Product } from '@/types/product'
import { ProductCard } from './ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useWallet } from '@/lib/api'

interface ProductGridProps {
  products?: Product[]
  isLoading?: boolean
  onBuy?: (product: Product) => void
}

export function ProductGrid({ products, isLoading, onBuy }: ProductGridProps) {
  const { data: wallet } = useWallet()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="product-grid-loading">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border">
            <Skeleton className="aspect-square" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center" data-testid="product-grid-empty">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          userKernels={wallet?.kernels_balance ?? 0}
          userStars={wallet?.stars_balance ?? 0}
          onBuy={onBuy}
        />
      ))}
    </div>
  )
}

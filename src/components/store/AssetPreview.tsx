import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/types/product'

const BADGE_PATHS: Record<ProductCategory, string> = {
  theme: '/assets/badges/popcorn.svg',
  badge: '/assets/badges/star.svg',
  frame: '/assets/badges/ticket.svg',
  wallpaper: '/assets/badges/popcorn.svg',
  emoji_pack: '/assets/badges/chest.svg',
  icon: '/assets/badges/star.svg',
  background: '/assets/badges/popcorn.svg',
  asset_pack: '/assets/badges/chest.svg',
}

const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'drop-shadow(0 0 6px rgba(0, 212, 170, 0.3))',
  rare: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))',
  epic: 'drop-shadow(0 0 10px rgba(255, 179, 0, 0.5))',
  legendary: 'drop-shadow(0 0 14px rgba(255, 107, 53, 0.6)) drop-shadow(0 0 28px rgba(255, 107, 53, 0.3))',
}

interface AssetPreviewProps {
  type: ProductCategory
  rarity?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
}

export function AssetPreview({ type, rarity = 'common', className, size = 'md' }: AssetPreviewProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-bg-hover/50 flex items-center justify-center overflow-hidden',
        sizeMap[size],
        className
      )}
    >
      <img
        src={BADGE_PATHS[type]}
        alt={type}
        className="h-3/4 w-3/4 object-contain transition-transform duration-300 group-hover:scale-110"
        style={{ filter: RARITY_GLOW[rarity] ?? '' }}
        loading="lazy"
      />
    </div>
  )
}

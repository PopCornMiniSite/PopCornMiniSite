import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProductRarity } from '@/types/product'
import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

interface RarityBadgeProps {
  rarity: ProductRarity
  className?: string
  showIcon?: boolean
}

const rarityConfig: Record<ProductRarity, { variant: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; labelKey: string; glow: string }> = {
  common: {
    variant: 'common',
    labelKey: 'store:rarity.common',
    glow: '',
  },
  uncommon: {
    variant: 'uncommon',
    labelKey: 'store:rarity.uncommon',
    glow: 'shadow-[0_0_6px_rgba(0,212,170,0.3)]',
  },
  rare: {
    variant: 'rare',
    labelKey: 'store:rarity.rare',
    glow: 'shadow-[0_0_8px_rgba(139,92,246,0.4)]',
  },
  epic: {
    variant: 'epic',
    labelKey: 'store:rarity.epic',
    glow: 'shadow-[0_0_10px_rgba(255,179,0,0.4)]',
  },
  legendary: {
    variant: 'legendary',
    labelKey: 'store:rarity.legendary',
    glow: 'shadow-[0_0_12px_rgba(255,107,53,0.5)]',
  },
}

export function RarityBadge({ rarity, className, showIcon = false }: RarityBadgeProps) {
  const { t } = useTranslation()
  const config = rarityConfig[rarity] ?? rarityConfig.common

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'text-xs gap-1',
        config.glow,
        className
      )}
      data-testid="rarity-badge"
    >
      {(showIcon || rarity === 'legendary' || rarity === 'epic') && (
        <Sparkles className="w-3 h-3" />
      )}
      {t(config.labelKey)}
    </Badge>
  )
}

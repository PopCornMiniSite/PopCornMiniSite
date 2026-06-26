import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/types/product'
import { useStoreStore } from '@/stores/storeStore'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Sparkles, Paintbrush, Award, Frame, Image, SmilePlus, Globe, Package, LayoutGrid } from 'lucide-react'

interface CategoryTabsProps {
  categories?: ProductCategory[]
}

const CATEGORY_CONFIG: Record<string, { labelKey: string; icon: React.ComponentType<{ className?: string }> }> = {
  all: { labelKey: 'store:categories.all', icon: LayoutGrid },
  asset_pack: { labelKey: 'store:categories.asset_pack', icon: Package },
  theme: { labelKey: 'store:categories.theme', icon: Paintbrush },
  badge: { labelKey: 'store:categories.badge', icon: Award },
  wallpaper: { labelKey: 'store:categories.wallpaper', icon: Image },
  frame: { labelKey: 'store:categories.frame', icon: Frame },
  emoji_pack: { labelKey: 'store:categories.emoji_pack', icon: SmilePlus },
  icon: { labelKey: 'store:categories.icon', icon: Sparkles },
  background: { labelKey: 'store:categories.background', icon: Globe },
}

const ALL_CATEGORIES: ProductCategory[] = [
  'asset_pack',
  'theme',
  'badge',
  'wallpaper',
  'frame',
  'emoji_pack',
  'icon',
  'background',
]

export function CategoryTabs({ categories = ALL_CATEGORIES }: CategoryTabsProps) {
  const { t } = useTranslation()
  const { selectedCategory, setCategory } = useStoreStore()

  const allCategories = ['all', ...categories]

  return (
    <ScrollArea className="w-full" data-testid="category-tabs">
      <div className="flex gap-2 pb-2">
        {allCategories.map((cat) => {
          const config = CATEGORY_CONFIG[cat]
          const Icon = config?.icon ?? Sparkles
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1.5',
                selectedCategory === cat
                  ? 'bg-brand-primary text-white shadow-[0_4px_12px_rgba(255,107,53,0.3)]'
                  : 'bg-bg-tertiary text-text-secondary border border-border-subtle hover:bg-bg-hover hover:text-text-primary hover:border-border-default',
              )}
              data-testid={`category-tab-${cat}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(config?.labelKey ?? cat)}
            </button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

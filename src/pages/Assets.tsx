import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { useUserAssets } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useActivateAsset } from '@/lib/api'
import { Paintbrush, Package } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'

export default function AssetsPage() {
  const { t } = useTranslation()
  const { data: assets, isLoading } = useUserAssets()
  const activateAsset = useActivateAsset()

  const handleActivate = (assetItemId: string, productId: number) => {
    activateAsset.mutate({ asset_item_id: assetItemId, product_id: productId })
  }

  return (
    <motion.div
      className="p-4"
      data-testid="assets-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : !assets?.length ? (
        <motion.div className="flex flex-col items-center justify-center py-12 text-center" variants={staggerItem}>
          <div className="h-16 w-16 rounded-2xl bg-bg-tertiary border border-border-subtle flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-text-tertiary" />
          </div>
          <p className="text-sm text-text-tertiary">{t('store:no_assets')}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              variants={staggerItem}
              className="flex items-center gap-4 rounded-xl bg-bg-tertiary border border-border-subtle p-4"
              data-testid="asset-item"
            >
              <div className="h-16 w-16 rounded-xl bg-bg-hover flex items-center justify-center border border-border-subtle">
                <Paintbrush className="w-8 h-8 text-text-tertiary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-text-primary">{asset.product.name}</h3>
                <p className="text-xs text-text-tertiary">{asset.product.category}</p>
                <Badge variant={asset.is_active ? 'default' : 'secondary'} className="mt-1 text-xs">
                  {asset.is_active ? t('store:active') : t('store:inactive')}
                </Badge>
              </div>
              <Button
                variant={asset.is_active ? 'outline' : 'primary'}
                size="sm"
                onClick={() => handleActivate(asset.asset.id, asset.product_id)}
                disabled={asset.is_active || activateAsset.isPending}
                data-testid={`activate-${asset.id}`}
              >
                {asset.is_active ? t('store:active') : t('store:activate')}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

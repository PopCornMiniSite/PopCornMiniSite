export type ProductCategory =
  | 'asset_pack'
  | 'theme'
  | 'badge'
  | 'wallpaper'
  | 'frame'
  | 'emoji_pack'
  | 'icon'
  | 'background'

export type AssetType = 'theme' | 'badge' | 'wallpaper' | 'frame' | 'emoji' | 'icon' | 'background'

export type ProductRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type PaymentMethod = 'stars' | 'kernels' | 'both'

export interface AssetItem {
  id: string
  type: AssetType
  name: string
  file_url?: string
  preview_url?: string
  metadata?: Record<string, unknown>
}

export interface Product {
  id: number
  name: string
  description: string
  category: ProductCategory
  rarity: ProductRarity
  price_stars: number
  price_kernels?: number
  original_price_stars?: number
  original_price_kernels?: number
  payment_method: PaymentMethod
  image_url: string
  preview_images: string[]
  assets: AssetItem[]
  name_ar?: string
  name_en?: string
  is_purchasable: boolean
  is_purchased?: boolean
  is_limited: boolean
  max_quantity?: number
  sold_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface UserAsset {
  id: string
  user_id: string
  product_id: number
  product: Product
  asset: AssetItem
  is_active: boolean
  activated_at?: string
  purchased_at: string
}

export interface StoreProductsResponse {
  data: Product[]
  items: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

export interface ProductDetailResponse {
  data: Product
}

export interface UserAssetsResponse {
  data: UserAsset[]
  items: {
    total: number
  }
}

export interface ActivateAssetResponse {
  data: {
    activated: UserAsset
    deactivated?: UserAsset
  }
}

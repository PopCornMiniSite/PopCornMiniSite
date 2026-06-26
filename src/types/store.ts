export interface StoreItem {
  id: string
  title: string
  description: string
  price_stars: number
  icon: string
  category: 'subscription' | 'feature' | 'gift'
}

export interface Purchase {
  id: string
  item_id: string
  user_id: number
  stars_spent: number
  purchased_at: string
  status: 'completed' | 'refunded' | 'failed'
}

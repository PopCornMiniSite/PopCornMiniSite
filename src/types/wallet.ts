export type EarningPath = 'daily_streak' | 'watch_to_earn' | 'social' | 'purchase_bonus' | 'referral'

export type PurchaseCurrency = 'stars' | 'kernels'

export interface Wallet {
  stars_balance: number
  kernels_balance: number
  total_earned_kernels: number
  total_spent_kernels: number
}

export interface WalletResponse {
  data: Wallet
}

export interface DailyStreak {
  current_streak: number
  longest_streak: number
  last_claim_date: string | null
  today_claimed: boolean
  reward_today: number
  next_reward: number
}

export interface DailyStreakResponse {
  data: DailyStreak
}

export interface ClaimDailyStreakResponse {
  data: {
    claimed: boolean
    reward: number
    new_streak: number
    kernels_balance: number
  }
}

export interface EarningEntry {
  id: string
  path: EarningPath
  amount: number
  description: string
  created_at: string
}

export interface EarningHistoryResponse {
  data: EarningEntry[]
  items: {
    total: number
  }
}

export interface HybridPurchaseRequest {
  product_id: string
  currency: PurchaseCurrency
  idempotency_key: string
}

export interface HybridPurchaseResponse {
  data: {
    invoice_link?: string
    payload?: string
    product_id: string
    currency: PurchaseCurrency
    amount: number
    new_stars_balance: number
    new_kernels_balance: number
  }
}

export interface KernelsBalanceResponse {
  data: {
    balance: number
    total_earned: number
    total_spent: number
  }
}

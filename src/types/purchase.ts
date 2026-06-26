import type { Product } from './product'
import type { PurchaseCurrency } from './wallet'

export type PurchaseStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface CreateInvoiceRequest {
  product_id: string
  idempotency_key: string
}

export interface CreateInvoiceResponse {
  data: {
    invoice_link: string
    payload: string
    product: Product
  }
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  product: Product
  amount_stars: number
  amount_kernels: number
  currency: PurchaseCurrency
  status: PurchaseStatus
  telegram_payment_id?: string
  invoice_payload?: string
  created_at: string
  completed_at?: string
}

export interface PurchasesResponse {
  data: Purchase[]
  items: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

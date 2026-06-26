export interface StreamUrlResponse {
  url: string
  fallback_used: boolean
  expires_at: string
}

export interface ProgressReport {
  content_type: 'movie' | 'episode'
  content_id: number
  season?: number
  episode?: number
  position: number
  duration: number
  completed: boolean
}

export interface ProgressResponse {
  ok: boolean
}

export interface QualityOption {
  label: string
  url: string
  width: number
  height: number
}

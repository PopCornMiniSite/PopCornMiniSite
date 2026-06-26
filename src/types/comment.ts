export type CommentSort = 'newest' | 'oldest' | 'popular'

export type LikeType = 'like' | 'dislike'

export type ReportReason =
  | 'spam'
  | 'offensive'
  | 'spoiler'
  | 'harassment'
  | 'other'

export interface Comment {
  id: string
  user_id: string
  first_name: string
  username?: string
  avatar_url?: string
  is_verified?: boolean
  tmdb_id: number
  media_type: 'movie' | 'series'
  parent_id?: string
  content: string
  is_spoiler: boolean
  likes_count: number
  dislikes_count: number
  replies_count: number
  user_like_type?: LikeType
  is_flagged: boolean
  replies?: Comment[]
  created_at: string
  updated_at: string
}

export interface CommentLike {
  id: string
  user_id: string
  comment_id: string
  type: LikeType
  created_at: string
}

export interface CommentReport {
  id: string
  user_id: string
  comment_id: string
  reason: ReportReason
  description?: string
  created_at: string
}

export interface CommentsResponse {
  data: Comment[]
  items: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

export interface CreateCommentRequest {
  tmdb_id: number
  media_type: 'movie' | 'series'
  parent_id?: string
  content: string
  is_spoiler: boolean
  mention_ids?: string[]
}

export interface CreateCommentResponse {
  data: Comment
}

export interface LikeCommentRequest {
  type: LikeType
}

export interface LikeCommentResponse {
  data: {
    like?: CommentLike
    removed?: boolean
  }
}

export interface ReportCommentRequest {
  reason: ReportReason
  description?: string
}

export interface Rating {
  id: string
  user_id: string
  first_name: string
  username?: string
  avatar_url?: string
  tmdb_id: number
  media_type: 'movie' | 'series'
  rating: number
  review?: string
  is_spoiler: boolean
  helpful_count: number
  is_helpful?: boolean
  created_at: string
  updated_at: string
}

export interface CreateRatingRequest {
  tmdb_id: number
  media_type: 'movie' | 'series'
  rating: number
  review?: string
  is_spoiler: boolean
}

export interface CreateRatingResponse {
  data: Rating
}

export interface RatingsResponse {
  data: Rating[]
  items: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

export interface MentionAutocompleteUser {
  id: string
  name: string
  avatar_url?: string
}

export interface MentionAutocompleteResponse {
  data: MentionAutocompleteUser[]
}

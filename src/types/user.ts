import type { UserAsset } from './product'

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends'

export interface UserBadge {
  id: string
  name: string
  description: string
  image_url: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  earned_at: string
}

export interface User {
  id: number
  username?: string
  first_name: string
  last_name?: string
  language_code: string
  is_premium?: boolean
  photo_url?: string
  stars_balance: number
  bio?: string
  theme_id?: string
  frame_id?: string
  assets?: UserAsset[]
  badges?: UserBadge[]
  friends_count: number
  parties_hosted: number
  parties_joined: number
  total_watch_time: number
  created_at: string
}

export interface UserStats {
  total_watch_time: number
  movies_watched: number
  series_completed: number
  friends_count: number
  rank_position: number
}

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  friend_user: {
    id: number
    name: string
    avatar_url?: string
    is_online: boolean
    last_seen_at?: string
  }
  status: FriendStatus
  created_at: string
}

export interface FriendRequest {
  id: string
  from_user_id: number
  to_user_id: number
  from_user: {
    id: number
    name: string
    avatar_url?: string
  }
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export interface FriendsResponse {
  data: Friend[]
  items: {
    total: number
  }
}

export interface FriendRequestsResponse {
  data: FriendRequest[]
  items: {
    total: number
  }
}

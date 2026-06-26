export type PartyRole = 'leader' | 'follower'

export type PartyStatus = 'waiting' | 'active' | 'ended'

export type PartyVisibility = 'public' | 'private'

export interface Participant {
  id: string
  user_id: string
  name: string
  avatar_url?: string
  role: PartyRole
  is_ready: boolean
  is_online: boolean
  is_muted: boolean
  is_kicked: boolean
  joined_at: string
}

export interface PartyRoom {
  id: string
  room_code: string
  host_user_id: string
  title: string
  media_type: 'movie' | 'series' | 'episode'
  media_id: number
  series_id?: number
  season_number?: number
  episode_number?: number
  visibility: PartyVisibility
  status: PartyStatus
  max_participants: number
  participant_count: number
  participants: Participant[]
  created_at: string
}

export interface PartyMessage {
  id: string
  user_id: string
  user_name: string
  content: string
  type: 'chat' | 'system' | 'reaction' | 'join' | 'leave'
  reply_to_id?: string
  reactions?: Record<string, string[]>
  created_at: string
}

export interface SyncEvent {
  type: 'sync'
  is_playing: boolean
  position: number
  timestamp: number
  playback_rate: number
}

export interface HeartbeatEvent {
  type: 'heartbeat'
  timestamp: number
}

export interface PongEvent {
  type: 'pong'
  timestamp: number
}

export interface ChatEvent {
  type: 'chat'
  message: PartyMessage
}

export interface ReactionEvent {
  type: 'reaction'
  emoji: string
  target_id?: string
  target_type?: 'message' | 'user'
  user_id: string
}

export interface BufferingEvent {
  type: 'buffering'
  is_buffering: boolean
  user_id: string
}

export interface ReadyEvent {
  type: 'ready'
  user_id: string
  is_ready: boolean
}

export interface AllReadyEvent {
  type: 'all_ready'
  leader_user_id: string
  position: number
}

export interface UserJoinedEvent {
  type: 'user_joined'
  participant: Participant
}

export interface UserLeftEvent {
  type: 'user_left'
  user_id: string
}

export interface LeaderChangedEvent {
  type: 'leader_changed'
  new_leader_user_id: string
}

export interface KickedEvent {
  type: 'kicked'
  user_id: string
}

export interface ErrorEvent {
  type: 'error'
  code: string
  message: string
}

export interface ReactionSentEvent {
  type: 'reaction_sent'
  emoji: string
  message_id?: string
}

export type ServerEvent =
  | SyncEvent
  | PongEvent
  | ChatEvent
  | ReactionEvent
  | BufferingEvent
  | ReadyEvent
  | AllReadyEvent
  | UserJoinedEvent
  | UserLeftEvent
  | LeaderChangedEvent
  | KickedEvent
  | ErrorEvent
  | ReactionSentEvent

export interface SyncCommand {
  type: 'sync'
  is_playing: boolean
  position: number
  playback_rate: number
}

export interface HeartbeatCommand {
  type: 'heartbeat'
  timestamp: number
}

export interface ChatCommand {
  type: 'chat'
  content: string
  reply_to_id?: string
  mention_ids?: string[]
}

export interface ReactionCommand {
  type: 'reaction'
  emoji: string
  target_id?: string
  target_type?: 'message' | 'user'
}

export interface BufferingCommand {
  type: 'buffering'
  is_buffering: boolean
}

export interface ReadyCommand {
  type: 'ready'
  is_ready: boolean
}

export interface AuthCommand {
  type: 'auth'
  initData: string
}

export interface PingCommand {
  type: 'ping'
  timestamp: number
}

export type ClientCommand =
  | AuthCommand
  | SyncCommand
  | HeartbeatCommand
  | ChatCommand
  | ReactionCommand
  | BufferingCommand
  | ReadyCommand
  | PingCommand

export interface CreatePartyRequest {
  title: string
  media_type: 'movie' | 'series' | 'episode'
  media_id: number
  series_id?: number
  season_number?: number
  episode_number?: number
  visibility: PartyVisibility
  password?: string
  max_participants?: number
}

export interface CreatePartyResponse {
  data: {
    room: PartyRoom
    room_code: string
    share_link: string
  }
}

export interface JoinPartyRequest {
  room_code: string
  password?: string
}

export interface JoinPartyResponse {
  data: {
    room: PartyRoom
    ws_url: string
  }
}

export interface PartyListResponse {
  data: PartyRoom[]
  items: {
    total: number
    page: number
    limit: number
    has_more: boolean
  }
}

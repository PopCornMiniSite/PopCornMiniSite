import { useEffect, useRef, useCallback } from 'react'
import { usePartyStore } from '@/stores/partyStore'
import { TypedWebSocket } from '@/lib/websocket'
import { useTelegram } from '@/providers/TelegramProvider'

const WS_BASE = import.meta.env.VITE_WS_URL ?? import.meta.env.VITE_API_URL ?? ''

export function usePartyWebSocket(partyId: string | undefined, enabled: boolean = true) {
  const wsRef = useRef<TypedWebSocket | null>(null)
  const { initDataRaw } = useTelegram()

  const store = usePartyStore()

  const connect = useCallback(() => {
    if (!partyId || !enabled || !initDataRaw) return

    const wsUrl = WS_BASE
      ? `${WS_BASE.replace(/^http/, 'ws')}/api/v1/party/ws/${partyId}`
      : `/api/v1/party/ws/${partyId}`

    const ws = new TypedWebSocket(wsUrl, {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 15000,
    })

    ws.on('chat', (data: any) => {
      if (data.message) {
        store.addChatMessage(data.message)
      }
    })

    ws.on('user_joined', (data: any) => {
      store.addParticipant({
        id: data.user_id,
        user_id: data.user_id,
        name: data.name ?? 'User',
        role: 'follower',
        is_ready: false,
        is_online: true,
        is_muted: false,
        is_kicked: false,
        joined_at: new Date().toISOString(),
      })
    })

    ws.on('user_left', (data: any) => {
      store.removeParticipant(data.user_id)
    })

    ws.on('participants', (data: any) => {
      if (data.participants) {
        store.setParticipants(data.participants.map((p: any) => ({
          id: p.user_id,
          user_id: p.user_id,
          name: p.name,
          role: p.role,
          is_ready: p.is_ready ?? false,
          is_online: p.is_online ?? true,
          is_muted: p.is_muted ?? false,
          is_kicked: false,
          joined_at: new Date().toISOString(),
        })))
      }
    })

    ws.on('ready', (data: any) => {
      store.setBuffering(data.user_id, data.is_ready)
    })

    ws.on('sync', (data: any) => {
      store.setPlaybackState({
        is_playing: data.is_playing ?? false,
        position: data.position ?? 0,
        playback_rate: data.playback_rate ?? 1,
      })
    })

    ws.on('buffering', (data: any) => {
      store.setBuffering(data.user_id, data.is_buffering)
    })

    ws.onStatus((status) => {
      store.setIsConnected(status === 'connected')
    })

    ws.connect(initDataRaw)
    wsRef.current = ws
  }, [partyId, enabled, initDataRaw])

  const disconnect = useCallback(() => {
    wsRef.current?.disconnect()
    wsRef.current = null
  }, [])

  useEffect(() => {
    if (enabled && partyId) {
      connect()
    }
    return () => {
      disconnect()
    }
  }, [partyId, enabled, connect, disconnect])

  const send = useCallback((data: object) => {
    wsRef.current?.send(data)
  }, [])

  const sendChat = useCallback((content: string) => {
    send({ type: 'chat', content })
  }, [send])

  const sendSync = useCallback((position: number, is_playing: boolean) => {
    send({ type: 'sync', position, is_playing, playback_rate: 1, timestamp: Date.now() })
  }, [send])

  const sendReady = useCallback((is_ready: boolean) => {
    send({ type: 'ready', is_ready })
  }, [send])

  return {
    send,
    sendChat,
    sendSync,
    sendReady,
    disconnect,
    isConnected: store.isConnected,
  }
}
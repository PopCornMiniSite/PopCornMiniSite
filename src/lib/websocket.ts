type MessageHandler = (data: unknown) => void
type StatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void

export interface WebSocketOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
}

export class TypedWebSocket {
  private ws: WebSocket | null = null
  private url: string
  private handlers = new Map<string, Set<MessageHandler>>()
  private statusHandlers = new Set<StatusHandler>()
  private retryCount = 0
  private maxRetries: number
  private baseDelay: number
  private maxDelay: number
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private messageQueue: unknown[] = []
  private isManualClose = false
  private authData: string | null = null

  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url
    this.maxRetries = options.maxRetries ?? 10
    this.baseDelay = options.baseDelay ?? 1000
    this.maxDelay = options.maxDelay ?? 30000
  }

  connect(authInitData?: string) {
    this.isManualClose = false
    this.authData = authInitData ?? null
    this.notifyStatus('connecting')

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.retryCount = 0
        this.notifyStatus('connected')
        this.startHeartbeat()
        this.flushQueue()

        if (this.authData) {
          this.send({ type: 'auth', initData: this.authData })
        }
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as { type: string } & Record<string, unknown>
          const typeHandlers = this.handlers.get(data.type)
          if (typeHandlers) {
            for (const handler of typeHandlers) {
              handler(data)
            }
          }
          const allHandlers = this.handlers.get('*')
          if (allHandlers) {
            for (const handler of allHandlers) {
              handler(data)
            }
          }
        } catch {
          // Ignore malformed messages
        }
      }

      this.ws.onclose = () => {
        this.stopHeartbeat()
        if (!this.isManualClose) {
          this.notifyStatus('reconnecting')
          this.scheduleReconnect()
        } else {
          this.notifyStatus('disconnected')
        }
      }

      this.ws.onerror = () => {
        // Error handling is done via onclose
      }
    } catch {
      this.notifyStatus('disconnected')
      this.scheduleReconnect()
    }
  }

  disconnect() {
    this.isManualClose = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.notifyStatus('disconnected')
  }

  send(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      this.messageQueue.push(data)
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler)
    return () => {
      this.statusHandlers.delete(handler)
    }
  }

  private notifyStatus(status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') {
    for (const handler of this.statusHandlers) {
      handler(status)
    }
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      this.notifyStatus('disconnected')
      return
    }

    const delay = Math.min(this.baseDelay * 2 ** this.retryCount, this.maxDelay)
    const jitter = delay * 0.1 * Math.random()
    this.retryCount += 1

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.authData ?? undefined)
    }, delay + jitter)
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'heartbeat', timestamp: Date.now() })
    }, 5000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private flushQueue() {
    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()
      if (msg) this.send(msg)
    }
  }
}

import { useRef, useEffect, useState, useCallback } from 'react'
import type { ManifestData } from '@/lib/turso'

const MAX_CONCURRENT = 6

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export interface DecryptPlayerState {
  progress: number
  status: 'loading' | 'ready' | 'playing' | 'error'
  error?: string
  buffered: number
}

export function useDecryptPlayer(manifest: ManifestData | null, videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<DecryptPlayerState>({ progress: 0, status: 'loading', buffered: 0 })
  const cryptoKeyRef = useRef<CryptoKey | null>(null)
  const segBufRef = useRef<Map<number, ArrayBuffer>>(new Map() as Map<number, ArrayBuffer>)
  const dlQueueRef = useRef<number[]>([])
  const dlActiveRef = useRef(0)
  const destroyedRef = useRef(false)
  const sbRef = useRef<SourceBuffer | null>(null)
  const msRef = useRef<MediaSource | null>(null)
  const streamingActiveRef = useRef(false)

  const importKey = useCallback(async (keyHex: string): Promise<CryptoKey> => {
    const raw = hexToBytes(keyHex)
    return crypto.subtle.importKey('raw', raw, { name: 'AES-CBC' }, false, ['decrypt'])
  }, [])

  const decryptSegment = useCallback(async (encrypted: ArrayBuffer, ivHex: string): Promise<Uint8Array> => {
    const iv = hexToBytes(ivHex)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKeyRef.current!, encrypted as any)
    return new Uint8Array(decrypted)
  }, [])

  const downloadSegment = useCallback(async (url: string, index: number) => {
    if (destroyedRef.current) return
    try {
      const r = await fetch(url)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const buf = await r.arrayBuffer()
      segBufRef.current.set(index, buf)
      const total = manifest?.segments.length ?? 0
      const pct = total > 0 ? Math.round((segBufRef.current.size / total) * 100) : 0
      setState(prev => ({ ...prev, progress: pct }))
      if (pct >= 100) {
        setState(prev => ({ ...prev, status: 'ready' }))
      }
    } catch (_e: unknown) {
      dlQueueRef.current.push(index)
    }
  }, [manifest])

  const pumpDownloads = useCallback(() => {
    while (dlActiveRef.current < MAX_CONCURRENT && dlQueueRef.current.length > 0 && !destroyedRef.current) {
      const idx = dlQueueRef.current.shift()!
      dlActiveRef.current++
      const seg = manifest?.segments[idx]
      if (!seg) continue
      const url = `${manifest!.base_url}/${seg.name}`
      downloadSegment(url, idx).finally(() => {
        dlActiveRef.current--
        pumpDownloads()
      })
    }
  }, [manifest, downloadSegment])

  const ensureSegment = useCallback(async (index: number): Promise<ArrayBuffer> => {
    while (!segBufRef.current.has(index) && !destroyedRef.current) {
      await new Promise(r => setTimeout(r, 100))
    }
    return segBufRef.current.get(index)!
  }, [])

  const startStreaming = useCallback(async () => {
    if (!manifest || !videoRef.current || streamingActiveRef.current) return
    streamingActiveRef.current = true

    const ms = new MediaSource()
    videoRef.current.src = URL.createObjectURL(ms)
    msRef.current = ms

    ms.addEventListener('sourceopen', async () => {
      const mime = 'video/mp2t; codecs="avc1.42E01E,mp4a.40.2"'
      try {
        const sb = ms.addSourceBuffer(mime)
        sb.mode = 'sequence'
        sbRef.current = sb

        const sbQueue: ArrayBuffer[] = []

        function flush() {
          while (sb && !sb.updating && sbQueue.length > 0 && !destroyedRef.current) {
            const data = sbQueue.shift()!
            try {
              sb.appendBuffer(data)
            } catch (_e: unknown) {
              // continue
            }
          }
        }

        sb.addEventListener('updateend', () => {
          if (destroyedRef.current) return
          if (sb.buffered.length) {
            const end = sb.buffered.end(sb.buffered.length - 1)
            setState(prev => ({ ...prev, buffered: end }))
          }
          flush()
        })

        try {
          const buf = await ensureSegment(0)
          const dec = await decryptSegment(buf, manifest._iv_hex)
          sbQueue.push(dec.buffer as ArrayBuffer)
          flush()

          await new Promise<void>(resolve => {
            const check = () => {
              if (destroyedRef.current) return resolve()
              if (sb.buffered.length > 0) return resolve()
              setTimeout(check, 50)
            }
            check()
          })

          setState(prev => ({ ...prev, status: 'playing' }))

          let nextIdx = 1
          let decrypting = false
          const pumpDecrypt = () => {
            if (decrypting || nextIdx >= manifest.segments.length || destroyedRef.current) return
            decrypting = true
            ensureSegment(nextIdx)
              .then(buf => decryptSegment(buf, manifest._iv_hex))
              .then(dec => {
                sbQueue.push(dec.buffer as ArrayBuffer)
                flush()
                nextIdx++
                decrypting = false
                pumpDecrypt()
              })
              .catch(() => {
                decrypting = false
                pumpDecrypt()
              })
          }
          pumpDecrypt()
        } catch (e: unknown) {
          const err = e instanceof Error ? e : new Error(String(e))
          setState(prev => ({ ...prev, status: 'error', error: err.message }))
        }
      } catch (e: unknown) {
        const err = e instanceof Error ? e : new Error(String(e))
        setState(prev => ({ ...prev, status: 'error', error: err.message }))
      }
    })
  }, [manifest, videoRef, ensureSegment, decryptSegment])

  useEffect(() => {
    if (!manifest) return
    destroyedRef.current = false

    importKey(manifest._key_hex).then(key => {
      cryptoKeyRef.current = key
      segBufRef.current = new Map()
      dlQueueRef.current = []
      dlActiveRef.current = 0

      const total = manifest.segments.length
      for (let i = 0; i < total; i++) dlQueueRef.current.push(i)
      pumpDownloads()
      startStreaming()
    })

    return () => {
      destroyedRef.current = true
      if (msRef.current && msRef.current.readyState === 'open') {
        try { msRef.current.endOfStream() } catch {}
      }
      sbRef.current = null
      msRef.current = null
    }
  }, [manifest, importKey, pumpDownloads, startStreaming])

  return state
}

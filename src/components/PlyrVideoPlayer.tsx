import { useRef, useEffect, useState, useCallback } from 'react'
import { VASTClient } from 'vast-client'

const VAST_AD_URL = 'https://physicaldad.com/d/m.F/zWd/GfN/vYZ/GFUN/EeQmP9su/ZuURlakRPuTGcTxQNtz/Ue1HMdjQkct-NmzvE/3ZNWT/UVzAMXwh'

const vastClient = new VASTClient()

interface PlyrVideoPlayerProps {
  url?: string
  autoPlay?: boolean
  onProgress?: (position: number, duration: number) => void
  onEnded?: () => void
}

export function PlyrVideoPlayer({ url, autoPlay, onProgress, onEnded }: PlyrVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef(onProgress)
  const endedRef = useRef(onEnded)
  progressRef.current = onProgress
  endedRef.current = onEnded

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [phase, setPhase] = useState<'ad' | 'content'>('ad')
  const [adUrl, setAdUrl] = useState<string | null>(null)
  const [adCountdown, setAdCountdown] = useState(5)
  const adTrackersRef = useRef<string[]>([])

  useEffect(() => {
    if (!url) return
    setPhase('ad')
    setStatus('loading')

    ;(async () => {
      try {
        const res = await vastClient.get(VAST_AD_URL)
        const ad = res?.ads?.[0]
        const creative = ad?.creatives?.[0]
        const media = creative?.mediaFiles?.find?.((m: any) => m.mimeType === 'video/mp4')
        if (media?.fileURL) {
          setAdUrl(media.fileURL)
          const tracker = creative?.trackingEvents?.complete?.[0]
          if (tracker) adTrackersRef.current = [tracker]
        } else {
          setPhase('content')
          setAdUrl(null)
        }
      } catch {
        setPhase('content')
        setAdUrl(null)
      }
    })()
  }, [url])

  const startContent = useCallback(() => {
    setPhase('content')
    setStatus('loading')
    const el = videoRef.current
    if (!el || !url) return
    el.src = url
    el.load()
    const onReady = () => {
      setStatus('ready')
      if (autoPlay) el.play().catch(() => {})
    }
    el.addEventListener('loadeddata', onReady, { once: true })
  }, [url, autoPlay])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !adUrl || phase !== 'ad') return

    setStatus('loading')
    el.src = adUrl
    el.load()

    const onAdReady = () => {
      setStatus('ready')
      el.play().catch(() => {})
      let count = Math.ceil(el.duration || 5)
      setAdCountdown(count)
      const interval = setInterval(() => {
        count = Math.ceil((el.duration || 5) - el.currentTime)
        setAdCountdown(Math.max(0, count))
      }, 250)
      el.addEventListener('timeupdate', () => {
        count = Math.ceil((el.duration || 5) - el.currentTime)
        setAdCountdown(Math.max(0, count))
      }, { once: true })
      return () => clearInterval(interval)
    }

    const onAdEnd = () => {
      adTrackersRef.current.forEach((t) => {
        try { fetch(t, { mode: 'no-cors' }) } catch {}
      })
      startContent()
    }

    el.addEventListener('loadeddata', onAdReady, { once: true })
    el.addEventListener('ended', onAdEnd, { once: true })
    el.addEventListener('error', () => startContent(), { once: true })

    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [adUrl, phase, startContent])

  useEffect(() => {
    if (phase !== 'content') return
    const el = videoRef.current
    if (!el || !url) return

    const onTime = () => {
      if (progressRef.current && el.duration) {
        progressRef.current(el.currentTime, el.duration)
      }
    }
    const onEnd = () => endedRef.current?.()

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd, { once: true })

    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [phase, url])

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative" style={{ aspectRatio: '16 / 9' }}>
      <video ref={videoRef} className="w-full h-full" controls={phase === 'content'} playsInline preload="auto" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
          <div className="text-white/80 text-sm">{phase === 'ad' ? 'جاري تحميل الإعلان...' : 'جاري التحميل...'}</div>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
          <div className="text-white/60 text-sm">تعذر تشغيل الفيديو</div>
        </div>
      )}
      {phase === 'ad' && status === 'ready' && (
        <div className="absolute top-3 right-3 z-10 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full">
          إعلان {adCountdown > 0 ? `- ${adCountdown}ث` : ''}
        </div>
      )}
    </div>
  )
}

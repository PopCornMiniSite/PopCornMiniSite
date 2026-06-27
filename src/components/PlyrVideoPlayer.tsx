import { useRef, useEffect, useState } from 'react'

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

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (!url) {
      setStatus('loading')
      return
    }

    setStatus('loading')
    el.src = url

    const onReady = () => {
      setStatus('ready')
      if (autoPlay) el.play().catch(() => {})
    }
    const onErr = () => {
      setStatus('error')
    }
    const onTime = () => {
      if (progressRef.current && el.duration) {
        progressRef.current(el.currentTime, el.duration)
      }
    }
    const onEnd = () => endedRef.current?.()

    el.addEventListener('loadeddata', onReady, { once: true })
    el.addEventListener('error', onErr, { once: true })
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd, { once: true })

    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
    }
  }, [url, autoPlay])

  if (!url) return null

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden relative" style={{ aspectRatio: '16 / 9' }}>
      <video ref={videoRef} className="w-full h-full" controls playsInline preload="auto" />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
          <div className="text-white/80 text-sm">جاري التحميل...</div>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none">
          <div className="text-white/60 text-sm">تعذر تشغيل الفيديو</div>
        </div>
      )}
    </div>
  )
}

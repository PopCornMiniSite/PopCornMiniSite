import { useRef, useEffect, useState, useCallback } from 'react'
import { useFloatingStore } from '@/stores/floatingPlayerStore'
import { attachHls } from '@/lib/hls'
import { attachDash } from '@/lib/dash'

interface PlyrVideoPlayerProps {
  url?: string
  title?: string
  autoPlay?: boolean
  onProgress?: (position: number, duration: number) => void
  onEnded?: () => void
}

export function PlyrVideoPlayer({ url, title = '', autoPlay, onProgress, onEnded }: PlyrVideoPlayerProps) {
  const floatingStore = useFloatingStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(onProgress)
  const endedRef = useRef(onEnded)
  const streamInstanceRef = useRef<{ destroy: () => void } | null>(null)

  useEffect(() => { progressRef.current = onProgress })
  useEffect(() => { endedRef.current = onEnded })

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const togglePlay = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) { el.play().catch(() => {}) }
    else { el.pause() }
  }, [])

  const skip = useCallback((sec: number) => {
    const el = videoRef.current
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.currentTime + sec, el.duration || 0))
  }, [])

  const seek = useCallback((clientX: number) => {
    if (!videoRef.current || !duration) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    videoRef.current.currentTime = pct * duration
  }, [duration])

  const toggleFS = useCallback(async () => {
    const c = containerRef.current
    if (!c) return
    try {
      if (document.fullscreenElement) { await document.exitFullscreen() }
      else { await c.requestFullscreen() }
    } catch {}
  }, [])

  const togglePiP = useCallback(async () => {
    const el = videoRef.current
    if (!el) return
    try {
      if (document.pictureInPictureElement) { await document.exitPictureInPicture() }
      else { await el.requestPictureInPicture() }
    } catch {}
  }, [])

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  // Cleanup - transfer to floating store
  useEffect(() => {
    return () => {
      if (videoRef.current && !videoRef.current.paused && url) {
        floatingStore.startPlayer(url, title)
        floatingStore.setPlaying(true)
        floatingStore.setCurrentTime(videoRef.current.currentTime)
        floatingStore.setDuration(videoRef.current.duration)
      }
    }
  }, [url, title, floatingStore])

  // Setup HLS/DASH or direct source
  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) { setBuffering(false); return }

    setError(null)
    setBuffering(true)
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    if (streamInstanceRef.current) {
      streamInstanceRef.current.destroy()
      streamInstanceRef.current = null
    }

    const isHls = url.includes('.m3u8')
    const isDash = url.includes('.mpd')

    if (isHls) {
      attachHls(url, video).then((instance) => {
        streamInstanceRef.current = instance
      })
    } else if (isDash) {
      attachDash(url, video).then((instance) => {
        streamInstanceRef.current = instance
      })
    } else {
      video.src = url
    }

    if (autoPlay) {
      video.play().catch(() => {})
    }

    return () => {
      if (streamInstanceRef.current) {
        streamInstanceRef.current.destroy()
        streamInstanceRef.current = null
      }
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [url, autoPlay])

  // Video events
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const onPlay = () => { setPlaying(true); setBuffering(false) }
    const onPause = () => setPlaying(false)
    const onWaiting = () => setBuffering(true)
    const onCanPlay = () => setBuffering(false)
    const onTime = () => {
      setCurrentTime(el.currentTime)
      progressRef.current?.(el.currentTime, el.duration || 0)
    }
    const onDur = () => setDuration(el.duration || 0)
    const onEnd = () => { setPlaying(false); endedRef.current?.() }
    const onErr = () => setError('فشل تحميل الفيديو')
    const onFS = () => setIsFullscreen(!!document.fullscreenElement)

    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('waiting', onWaiting)
    el.addEventListener('canplay', onCanPlay)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('durationchange', onDur)
    el.addEventListener('ended', onEnd)
    el.addEventListener('error', onErr)
    document.addEventListener('fullscreenchange', onFS)

    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('waiting', onWaiting)
      el.removeEventListener('canplay', onCanPlay)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('durationchange', onDur)
      el.removeEventListener('ended', onEnd)
      el.removeEventListener('error', onErr)
      document.removeEventListener('fullscreenchange', onFS)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!url) return null

  if (error) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16 / 9', background: '#0a0a0f' }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,10,15,0.9)' }}>
          <div className="text-center px-6">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-white/50 text-sm">{error}</p>
            <button onClick={() => { setError(null); videoRef.current?.load() }} className="mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-brand-primary-hover cursor-pointer">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl select-none"
      style={{ aspectRatio: '16 / 9', background: '#0a0a0f' }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload={autoPlay ? 'auto' : 'none'}
        onClick={togglePlay}
        onDoubleClick={toggleFS}
        style={{ background: '#0a0a0f' }}
      />

      {/* Loading spinner */}
      {buffering && playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
      )}

      {/* Center play when paused */}
      {!playing && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center z-[5] cursor-pointer" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <svg className="w-7 h-7 text-amber-400 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100 hover:opacity-100"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          opacity: 1,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
      >
        {/* Progress bar */}
        <div className="relative mx-2.5 mb-1.5 cursor-pointer" style={{ paddingTop: 6, paddingBottom: 6 }}
          onClick={(e) => seek(e.clientX)}>
          <div className="relative w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #f59e0b, #d97706)', boxShadow: '0 0 8px rgba(245,158,11,0.4)' }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 px-3 pb-3 text-white" dir="ltr">
          <button onClick={togglePlay} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              {playing ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/> : <path d="M8 5v14l11-7z"/>}
            </svg>
          </button>
          <button onClick={() => skip(-10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-4.97 1.28-6.4 3.22l-2.1-2.1V16h6.88l-2.4-2.4C9.52 12.11 10.94 11 12.5 11c2.07 0 3.75 1.68 3.75 3.75S14.57 18.5 12.5 18.5c-1.14 0-2.16-.51-2.85-1.32l-1.69 1.69A6.218 6.218 0 0012.5 20.5a6.5 6.5 0 000-13z"/></svg>
          </button>
          <button onClick={() => skip(10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c2.65 0 4.97 1.28 6.4 3.22l2.1-2.1V16h-6.88l2.4-2.4C15.48 12.11 14.06 11 12.5 11c-2.07 0-3.75 1.68-3.75 3.75s1.68 3.75 3.75 3.75c1.14 0 2.16-.51 2.85-1.32l1.69 1.69A6.218 6.218 0 0112.5 20.5a6.5 6.5 0 010-13z"/></svg>
          </button>
          <span className="text-xs text-white/50 font-mono tabular-nums flex-shrink-0 min-w-[80px] text-center" dir="ltr">
            {fmt(currentTime)} / {fmt(duration)}
          </span>
          <div className="flex-1 min-w-[4px]" />
          <button onClick={togglePiP} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0 hidden sm:block">
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>
          </button>
          <button onClick={toggleFS} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
              {isFullscreen ? <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/> : <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>}
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlyrVideoPlayer
import { useRef, useEffect, useState, useCallback } from 'react'
import { VASTClient } from 'vast-client'
import { usePlayer } from '@/contexts/PlayerContext'

interface PlyrVideoPlayerProps {
  url?: string
  title?: string
  autoPlay?: boolean
  onProgress?: (position: number, duration: number) => void
  onEnded?: () => void
}

const VAST_PROXY = `${(import.meta as any).env?.VITE_API_URL || ''}/api/v1/stream/vast`
const FALLBACK_VAST = 'https://www.radiantmediaplayer.com/vast/tags/inline-linear.xml'
const AD_SKIP_DELAY = 5
const AD_LOAD_TIMEOUT = 15000

export function PlyrVideoPlayer({ url, title = '', autoPlay, onProgress, onEnded }: PlyrVideoPlayerProps) {
  const playerCtx = usePlayer()

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(onProgress)
  const endedRef = useRef(onEnded)
  progressRef.current = onProgress
  endedRef.current = onEnded

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [hoverTime, setHoverTime] = useState(0)
  const [hoverX, setHoverX] = useState(0)
  const [showHoverPreview, setShowHoverPreview] = useState(false)
  const [seeking, setSeeking] = useState(false)

  const [adState, setAdState] = useState<'none' | 'loading' | 'playing' | 'skippable' | 'error' | 'done'>('none')
  const [adCountdown, setAdCountdown] = useState(AD_SKIP_DELAY)
  const [brightness, setBrightness] = useState(1)

  const [initialPlayDone, setInitialPlayDone] = useState(false)

  const contentUrlRef = useRef<string | null>(null)
  const adUrlRef = useRef<string | null>(null)
  const hasAdShownRef = useRef(false)
  const adCountdownRef = useRef(AD_SKIP_DELAY)
  const adTimerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const adLoadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const touchCurrentTimeRef = useRef(0)

  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastTapRef = useRef(0)
  const longPressRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const isLongPress = useRef(false)
  const gestureStartX = useRef(0)
  const gestureStartY = useRef(0)
  const gestureStartTime = useRef(0)
  const gestureVolumeStart = useRef(0)
  const gestureBrightnessStart = useRef(1)

  const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2]

  const switchToContent = useCallback(() => {
    const el = videoRef.current
    if (!el || !contentUrlRef.current) return
    adUrlRef.current = null
    hasAdShownRef.current = true
    setAdState('done')
    clearInterval(adTimerRef.current)
    el.src = contentUrlRef.current
    el.play().then(() => {
      setPlaying(true)
      setInitialPlayDone(true)
    }).catch(() => {})
    setDuration(0)
    setCurrentTime(0)
  }, [])

  const skipAd = useCallback(() => {
    clearInterval(adTimerRef.current)
    switchToContent()
  }, [switchToContent])

  const startAdTimer = useCallback(() => {
    adCountdownRef.current = AD_SKIP_DELAY
    setAdCountdown(AD_SKIP_DELAY)
    clearInterval(adTimerRef.current)
    adTimerRef.current = setInterval(() => {
      adCountdownRef.current--
      setAdCountdown(adCountdownRef.current)
      if (adCountdownRef.current <= 0) {
        clearInterval(adTimerRef.current)
        setAdState('skippable')
      }
    }, 1000)
  }, [])

  const fetchAndPlayAd = useCallback(async () => {
    if (!VAST_PROXY || hasAdShownRef.current || !contentUrlRef.current) {
      hasAdShownRef.current = true
      if (contentUrlRef.current) {
        const el = videoRef.current
        if (el) {
          el.src = contentUrlRef.current
          el.play().then(() => { setPlaying(true); setInitialPlayDone(true) }).catch(() => {})
        }
      }
      return
    }
    setAdState('loading')
    setStatus('loading')

    const client = new VASTClient()
    const timeout = setTimeout(() => {
      setAdState('error')
      switchToContent()
    }, AD_LOAD_TIMEOUT)
    adLoadTimerRef.current = timeout

    const tryVast = async (vastUrl: string): Promise<boolean> => {
      try {
        const response = await client.get(vastUrl)
        const ad = response.ads?.[0]
        const creative = ad?.creatives?.find((c: any) => c.type === 'linear')
        const mediaFile = creative?.mediaFiles?.[0] as any
        if (mediaFile?.fileURL) {
          adUrlRef.current = mediaFile.fileURL
          const el = videoRef.current
          if (el) {
            el.src = mediaFile.fileURL
            el.load()
            await el.play()
            setAdState('playing')
            startAdTimer()
            return true
          }
        }
      } catch {}
      return false
    }

    try {
      clearTimeout(timeout)
      const ok = await tryVast(VAST_PROXY)
      if (!ok) {
        const ok2 = await tryVast(FALLBACK_VAST)
        if (!ok2) {
          setAdState('done')
          hasAdShownRef.current = true
          if (contentUrlRef.current) {
            const el = videoRef.current
            if (el) {
              el.src = contentUrlRef.current
              el.play().then(() => { setPlaying(true); setInitialPlayDone(true) }).catch(() => {})
            }
          }
        }
      }
    } catch {
      clearTimeout(timeout)
      setAdState('error')
      hasAdShownRef.current = true
      if (contentUrlRef.current) {
        const el = videoRef.current
        if (el) {
          el.src = contentUrlRef.current
          el.play().then(() => { setPlaying(true); setInitialPlayDone(true) }).catch(() => {})
        }
      }
    }
  }, [startAdTimer, switchToContent])

  const updateVolume = useCallback((v: number) => {
    setVolume(v)
    setMuted(v === 0)
    if (videoRef.current) videoRef.current.volume = v
  }, [])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setMuted(videoRef.current.muted)
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (!initialPlayDone && !hasAdShownRef.current) {
      fetchAndPlayAd()
      return
    }
    if (adState === 'playing' || adState === 'loading') return
    if (adState !== 'done') return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      videoRef.current.pause()
      setPlaying(false)
    }
  }, [adState, fetchAndPlayAd, initialPlayDone])

  const skip = useCallback((sec: number) => {
    if (adState !== 'done') return
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + sec, videoRef.current.duration || 0))
    }
  }, [adState])

  const seek = useCallback((clientX: number) => {
    if (!videoRef.current || !duration) return
    if (adState !== 'done') return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    videoRef.current.currentTime = pct * duration
  }, [duration, adState])

  const toggleFS = useCallback(async () => {
    const c = containerRef.current
    if (!c) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await c.requestFullscreen()
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const el = videoRef.current
    if (!el) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await el.requestPictureInPicture()
      }
    } catch {}
  }, [])

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s)
    setShowSpeedMenu(false)
    if (videoRef.current) videoRef.current.playbackRate = s
  }, [])

  const hideControls = useCallback(() => {
    if (playing || adState === 'playing') setShowControls(false)
  }, [playing, adState])

  const showControlsTemp = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    controlsTimer.current = setTimeout(hideControls, 3000)
  }, [hideControls])

  const doubleTap = useCallback((side: 'left' | 'right') => {
    if (adState !== 'done') return
    skip(side === 'left' ? -10 : 10)
  }, [skip, adState])

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      clearTimeout(controlsTimer.current)
      clearTimeout(longPressRef.current)
      clearTimeout(adLoadTimerRef.current)
      clearInterval(adTimerRef.current)
      if (videoRef.current && !videoRef.current.paused && contentUrlRef.current) {
        playerCtx.startPlayer(contentUrlRef.current, title)
        playerCtx.setPlaying(true)
        playerCtx.setCurrentTime(videoRef.current.currentTime)
        playerCtx.setDuration(videoRef.current.duration)
      }
    }
  }, [playerCtx, title])

  useEffect(() => {
    contentUrlRef.current = url || null
  }, [url])

  useEffect(() => {
    const el = videoRef.current
    if (!el || !url) { setStatus('loading'); return }

    setStatus('loading')
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setBuffered(0)
    setSpeed(1)
    setAdState('none')
    setInitialPlayDone(false)
    hasAdShownRef.current = false

    if (!autoPlay) {
      el.removeAttribute('src')
      el.load()
      setStatus('ready')
      return
    }

    const onReady = () => {
      setStatus('ready')
      setDuration(el.duration || 0)
      showControlsTemp()
      if (!hasAdShownRef.current) {
        fetchAndPlayAd()
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onTime = () => {
      if (adState !== 'done') return
      setCurrentTime(el.currentTime)
      if (progressRef.current && el.duration) progressRef.current(el.currentTime, el.duration)
    }
    const onDur = () => { if (adState === 'done') setDuration(el.duration || 0) }
    const onEnd = () => {
      if (adState !== 'done') return
      setPlaying(false)
      endedRef.current?.()
    }
    const onErr = () => {
      if (adState !== 'done' && adState !== 'none') {
        switchToContent()
        return
      }
      setStatus('error')
    }
    const onVol = () => { setVolume(el.volume); setMuted(el.muted) }
    const onProgress = () => {
      if (el.buffered.length > 0) {
        setBuffered(el.buffered.end(el.buffered.length - 1) / (el.duration || 1))
      }
    }

    el.addEventListener('loadeddata', onReady, { once: true })
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('durationchange', onDur)
    el.addEventListener('ended', onEnd, { once: true })
    el.addEventListener('error', onErr, { once: true })
    el.addEventListener('volumechange', onVol)
    el.addEventListener('progress', onProgress)

    return () => {
      el.pause()
      el.removeAttribute('src')
      el.load()
      setInitialPlayDone(false)
    }
  }, [url, autoPlay, showControlsTemp, adState, fetchAndPlayAd, switchToContent])

  useEffect(() => {
    const onFS = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFS)
    return () => document.removeEventListener('fullscreenchange', onFS)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (adState === 'loading') return
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(5)
          break
        case 'ArrowUp':
          e.preventDefault()
          updateVolume(Math.min(1, volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          updateVolume(Math.max(0, volume - 0.1))
          break
        case 'f':
          e.preventDefault()
          toggleFS()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePlay, skip, updateVolume, toggleFS, toggleMute, volume, adState])

  const handleMouseDown = useCallback(() => {
    clearTimeout(controlsTimer.current)
  }, [])

  const handleMouseUp = useCallback(() => {
    controlsTimer.current = setTimeout(hideControls, 3000)
  }, [hideControls])

  const handleGestureStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    gestureStartX.current = touch.clientX
    gestureStartY.current = touch.clientY
    gestureStartTime.current = Date.now()
    gestureVolumeStart.current = volume
    gestureBrightnessStart.current = brightness
    isLongPress.current = false
    touchCurrentTimeRef.current = 0
    longPressRef.current = setTimeout(() => {
      isLongPress.current = true
      if (videoRef.current) videoRef.current.playbackRate = 2
    }, 600)
  }, [volume, brightness])

  const handleGestureMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    const dx = touch.clientX - gestureStartX.current
    const dy = touch.clientY - gestureStartY.current
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      clearTimeout(longPressRef.current)
      if (videoRef.current) videoRef.current.playbackRate = speed
    }
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
      if (adState !== 'done') return
      e.preventDefault()
      const pct = dx / (containerRef.current?.offsetWidth || 300)
      skip(pct * duration * 0.5)
      gestureStartX.current = touch.clientX
    } else if (Math.abs(dy) > 20) {
      e.preventDefault()
      if (touch.clientX < (containerRef.current?.offsetWidth || 300) / 2) {
        const newB = Math.max(0.1, Math.min(1, gestureBrightnessStart.current - (dy / 300)))
        setBrightness(newB)
        if (videoRef.current) videoRef.current.style.filter = `brightness(${newB})`
      } else {
        const newVol = Math.max(0, Math.min(1, gestureVolumeStart.current - (dy / 200)))
        updateVolume(newVol)
      }
    }
  }, [duration, speed, updateVolume, skip, adState])

  const handleGestureEnd = useCallback(() => {
    clearTimeout(longPressRef.current)
    if (videoRef.current) videoRef.current.playbackRate = speed
    if (isLongPress.current) return
    const elapsed = Date.now() - gestureStartTime.current
    if (elapsed < 250) {
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const relX = gestureStartX.current - rect.left
          doubleTap(relX < rect.width / 2 ? 'left' : 'right')
        }
        lastTapRef.current = 0
      } else {
        lastTapRef.current = now
        togglePlay()
      }
    }
  }, [togglePlay, doubleTap, speed])

  useEffect(() => {
    if (!showSpeedMenu) return
    const close = () => setShowSpeedMenu(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showSpeedMenu])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedPct = buffered * 100
  const isAd = adState === 'playing' || adState === 'loading' || adState === 'skippable'

  if (!url) return null

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl select-none"
      style={{ aspectRatio: '16 / 9', background: '#0a0a0f' }}
      onMouseMove={showControlsTemp}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload={autoPlay ? 'auto' : 'none'}
        onClick={togglePlay}
        onDoubleClick={toggleFS}
        style={{ background: '#0a0a0f', filter: `brightness(${brightness})` }}
      />

      {/* Animated gradient when paused */}
      {!playing && status === 'ready' && adState === 'done' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            background: 'radial-gradient(circle at 30% 40%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 60%, #d97706 0%, transparent 50%)',
            animation: 'pulse 4s ease-in-out infinite alternate'
          }} />
        </div>
      )}

      {/* Loading spinner */}
      {status === 'loading' && adState === 'none' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500/60 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Ad loading overlay */}
      {adState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30" style={{ background: 'rgba(10,10,15,0.85)' }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-white/40 text-xs">جارٍ تحميل الإعلان</p>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'rgba(10,10,15,0.9)' }}>
          <div className="text-center px-6">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-white/50 text-sm">تعذر تشغيل الفيديو</p>
          </div>
        </div>
      )}

      {/* Ad badge + skip */}
      {(adState === 'playing' || adState === 'skippable') && (
        <>
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
            <span className="bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">إعلان</span>
          </div>
          {adState === 'skippable' ? (
            <button
              onClick={skipAd}
              className="absolute bottom-24 right-3 z-30 bg-black/70 hover:bg-black/90 backdrop-blur rounded-lg px-3 py-1.5 text-white text-xs font-medium transition-colors cursor-pointer border border-white/15"
            >
              تخطي الإعلان
              <svg className="w-3.5 h-3.5 inline mr-1 -mt-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 18V6l8.5 6-8.5 6zm-1-6l-8.5 6V6l8.5 6z"/></svg>
            </button>
          ) : (
            <div className="absolute bottom-24 right-3 z-30 bg-black/50 backdrop-blur rounded-lg px-3 py-1.5 text-white/50 text-xs">
              تخطي بعد {adCountdown}
            </div>
          )}
        </>
      )}

      {/* Tap zones for gestures */}
      {adState === 'done' && status === 'ready' && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
        >
          <div
            className="w-full h-full pointer-events-auto"
            onTouchStart={handleGestureStart}
            onTouchMove={handleGestureMove}
            onTouchEnd={handleGestureEnd}
          />
        </div>
      )}

      {/* Skip indicators */}
      {adState === 'done' && status === 'ready' && (
        <>
          <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none opacity-0 transition-opacity duration-200 z-[2]" style={{ opacity: showControls ? 0.4 : 0 }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
          </div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-0 transition-opacity duration-200 z-[2]" style={{ opacity: showControls ? 0.4 : 0 }}>
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 18V6l8.5 6-8.5 6zm-1-6l-8.5 6V6l8.5 6z"/></svg>
          </div>
        </>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-all duration-300 ease-out ${showControls || !playing ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'}`}
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        {/* Progress bar */}
        <div
          className="relative mx-2.5 mb-1.5 cursor-pointer group/progress"
          style={{ paddingTop: 6, paddingBottom: 6 }}
          onMouseMove={(e) => {
            if (isAd) return
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
            setHoverTime(pct * (duration || 0))
            setHoverX(e.clientX - rect.left)
            setShowHoverPreview(true)
          }}
          onMouseLeave={() => setShowHoverPreview(false)}
          onMouseDown={(e) => { if (!isAd) { setSeeking(true); seek(e.clientX) } }}
          onMouseUp={() => setSeeking(false)}
          onMouseMoveCapture={(e) => { if (seeking && !isAd) seek(e.clientX) }}
          onClick={(e) => { if (!isAd) seek(e.clientX) }}
        >
          {showHoverPreview && duration > 0 && !isAd && (
            <div
              className="absolute -top-7 translate-x-[-50%] bg-black/80 backdrop-blur rounded px-1.5 py-0.5 pointer-events-none z-30"
              style={{ left: hoverX, direction: 'ltr' }}
            >
              <span className="text-[11px] font-medium text-white">{fmt(hoverTime)}</span>
            </div>
          )}

          <div className="relative w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            {bufferedPct > 0 && (
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${bufferedPct}%`, background: 'rgba(255,255,255,0.2)' }} />
            )}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
              style={{
                width: `${progress}%`,
                background: isAd ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                boxShadow: isAd ? '0 0 8px rgba(239,68,68,0.4)' : '0 0 8px rgba(245,158,11,0.4)'
              }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150"
                style={{ boxShadow: '0 0 6px rgba(245,158,11,0.6)' }}
              />
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-center gap-2 px-3 pb-3 text-white" dir="ltr">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            {adState === 'loading' ? (
              <svg className="w-5 h-5 animate-spin text-white/60" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                {playing ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/> : <path d="M8 5v14l11-7z"/>}
              </svg>
            )}
          </button>

          {/* Skip back 10s */}
          <button onClick={() => skip(-10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-4.97 1.28-6.4 3.22l-2.1-2.1V16h6.88l-2.4-2.4C9.52 12.11 10.94 11 12.5 11c2.07 0 3.75 1.68 3.75 3.75S14.57 18.5 12.5 18.5c-1.14 0-2.16-.51-2.85-1.32l-1.69 1.69A6.218 6.218 0 0012.5 20.5a6.5 6.5 0 000-13z"/></svg>
          </button>

          {/* Skip forward 10s */}
          <button onClick={() => skip(10)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c2.65 0 4.97 1.28 6.4 3.22l2.1-2.1V16h-6.88l2.4-2.4C15.48 12.11 14.06 11 12.5 11c-2.07 0-3.75 1.68-3.75 3.75s1.68 3.75 3.75 3.75c1.14 0 2.16-.51 2.85-1.32l1.69 1.69A6.218 6.218 0 0112.5 20.5a6.5 6.5 0 010-13z"/></svg>
          </button>

          {/* Time */}
          {adState === 'done' && (
            <span className="text-xs text-white/50 font-mono tabular-nums flex-shrink-0 min-w-[80px] text-center" dir="ltr">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          )}

          <div className="flex-1 min-w-[4px]" />

          {/* Speed */}
          {adState === 'done' && (
            <div className="relative flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu) }}
                className="p-1.5 text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                {speed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-white/10 min-w-[80px]" style={{ background: 'rgba(0,0,0,0.92)' }}>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeSpeed(s)}
                      className={`block w-full text-center px-4 py-2 text-xs transition-colors cursor-pointer ${
                        s === speed ? 'text-amber-400 bg-amber-500/10 font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol flex-shrink-0">
            <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer">
              <svg className="w-4 h-4 text-white/60 hover:text-white" viewBox="0 0 24 24" fill="currentColor">
                {muted || volume === 0 ? (
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                ) : volume < 0.5 ? (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                ) : (
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                )}
              </svg>
            </button>
            <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-200 origin-right flex items-center">
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => updateVolume(parseFloat(e.target.value))}
                className="w-20 h-1 accent-amber-500 cursor-pointer"
                style={{ background: `linear-gradient(90deg, #f59e0b ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.15) ${(muted ? 0 : volume) * 100}%)` }}
              />
            </div>
          </div>

          {/* PiP */}
          <button onClick={togglePiP} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0 hidden sm:block">
            <svg className="w-4 h-4 text-white/60 hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFS} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4 text-white/60 hover:text-white" viewBox="0 0 24 24" fill="currentColor">
              {isFullscreen ? (
                <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
              ) : (
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Center play button when paused (content only) */}
      {adState === 'done' && status === 'ready' && !playing && (
        <div className="absolute inset-0 flex items-center justify-center z-[5] cursor-pointer" onClick={togglePlay}>
          <div className="relative group/btn">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-200 hover:scale-110" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <svg className="w-7 h-7 text-amber-400 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </div>
      )}

      {/* Top gradient */}
      <div className="absolute inset-x-0 top-0 h-20 pointer-events-none z-[3]" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 100%)' }} />

      {/* Keyboard hint */}
      {adState === 'done' && !playing && status === 'ready' && (
        <div className="absolute top-3 right-3 z-[4] pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur rounded-lg px-2 py-1">
            <kbd className="text-[9px] text-white/30 font-mono bg-white/5 rounded px-1 py-0.5">Space</kbd>
            <span className="text-[9px] text-white/20">تشغيل</span>
          </div>
        </div>
      )}
    </div>
  )
}

import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useMediaSession } from '@/hooks/useMediaSession'
import { useWatchToEarn } from '@/hooks/useWatchToEarn'
import { useDecryptPlayer } from '@/hooks/useDecryptPlayer'
import { Slider } from '@/components/ui/slider'
import { attachHls } from '@/lib/hls'
import { attachDash } from '@/lib/dash'
import { Popcorn } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ManifestData } from '@/lib/turso'

interface VideoPlayerProps {
  url?: string
  manifestData?: ManifestData
  title?: string
  type: 'movie' | 'episode'
  contentId: number
  season?: number
  episode?: number
  autoPlay?: boolean
  onProgress?: (position: number, duration: number) => void
  onEnded?: () => void
  onError?: (error: Error) => void
  headerSlot?: ReactNode
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export function VideoPlayer({
  url,
  manifestData,
  title = '',
  autoPlay = false,
  onProgress,
  onEnded,
  onError,
  headerSlot,
}: VideoPlayerProps) {
  const { t } = useTranslation('player')
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const streamInstanceRef = useRef<{ destroy: () => void } | null>(null)
  const progressThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { startTracking, stopTracking } = useWatchToEarn()

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false)
      }
    }, 3000)
  }, [])

  const toggleControls = useCallback(() => {
    setShowControls((prev) => {
      if (!prev) hideControlsAfterDelay()
      return !prev
    })
  }, [hideControlsAfterDelay])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0))
  }, [])

  const seekRelative = useCallback(
    (delta: number) => {
      seek(currentTime + delta)
    },
    [currentTime, seek],
  )

  const adjustVolume = useCallback((delta: number) => {
    const video = videoRef.current
    if (!video) return
    const newVolume = Math.max(0, Math.min(1, video.volume + delta))
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume > 0 && video.muted) {
      video.muted = false
      setIsMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      // Fallback for Telegram WebApp
      try {
        const tg = window.Telegram?.WebApp
        if (tg && 'requestFullscreen' in tg) {
          ;(tg as { requestFullscreen: () => void }).requestFullscreen()
        }
      } catch {
        // no-op
      }
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture()
      }
    } catch {
      // PiP not supported
    }
  }, [])

  const changeSpeed = useCallback((speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackRate(speed)
    setShowSettings(false)
  }, [])

  const handleSeekSliderChange = useCallback(
    (values: number[]) => {
      const val = values[0]
      if (val !== undefined) {
        seek(val)
      }
    },
    [seek],
  )

  const handleVolumeSliderChange = useCallback(
    (values: number[]) => {
      const val = values[0]
      if (val !== undefined) {
        const video = videoRef.current
        if (video) {
          video.volume = val
          setVolume(val)
        }
      }
    },
    [],
  )

  const shortcuts = useMemo(
    () => ({
      ' ': togglePlay,
      arrowleft: () => seekRelative(-10),
      arrowright: () => seekRelative(10),
      arrowup: () => adjustVolume(0.1),
      arrowdown: () => adjustVolume(-0.1),
      f: toggleFullscreen,
      m: toggleMute,
    }),
    [togglePlay, seekRelative, adjustVolume, toggleFullscreen, toggleMute],
  )

  useKeyboardShortcuts(shortcuts)

  useMediaSession({
    title,
    onPlay: () => {
      videoRef.current?.play().catch(() => {})
    },
    onPause: () => {
      videoRef.current?.pause()
    },
    onSeekForward: () => seekRelative(10),
    onSeekBackward: () => seekRelative(-10),
  })

  const decryptState = useDecryptPlayer(manifestData ?? null, videoRef)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => {
      setIsPlaying(true)
      hideControlsAfterDelay()
      startTracking()
    }
    const onPause = () => {
      setIsPlaying(false)
      setShowControls(true)
      stopTracking()
    }
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => setIsBuffering(false)
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (onProgress && !progressThrottleRef.current) {
        progressThrottleRef.current = setTimeout(() => {
          progressThrottleRef.current = null
          onProgress(video.currentTime, video.duration || 0)
        }, 1000)
      }
    }
    const onLoadedMetadata = () => setDuration(video.duration)
    const onEnded = () => {
      setIsPlaying(false)
      setShowControls(true)
      onEnded?.()
    }
    const handleVideoError = () => {
      const err = video.error
      const msg = err ? `Error ${err.code}: ${err.message}` : 'Unknown error'
      setError(msg)
      onError?.(new Error(msg))
    }
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('ended', onEnded)
    video.addEventListener('error', handleVideoError)
    document.addEventListener('fullscreenchange', onFullscreenChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('error', handleVideoError)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (progressThrottleRef.current) clearTimeout(progressThrottleRef.current)
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [onProgress, onEnded, onError, hideControlsAfterDelay, startTracking, stopTracking])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Decrypt pipeline handles its own MSE, skip URL loading
    if (manifestData) return

    if (!url) return

    setError(null)
    setIsBuffering(true)

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

    return () => {
      if (streamInstanceRef.current) {
        streamInstanceRef.current.destroy()
        streamInstanceRef.current = null
      }
    }
  }, [url, manifestData])

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center aspect-video w-full rounded-lg bg-bg-secondary"
        data-testid="video-player-error"
      >
        <p className="text-lg font-medium mb-2 text-text-primary">
          {error}
        </p>
        <button
          onClick={() => {
            setError(null)
            if (videoRef.current) {
              videoRef.current.load()
            }
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-brand-primary text-white hover:bg-brand-primary-hover"
          data-testid="video-player-retry"
        >
          {t('settings', 'Retry')}
        </button>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      data-testid="video-player"
      role="region"
      aria-label={title || t('play')}
      onMouseMove={toggleControls}
      onTouchStart={toggleControls}
    >
      {headerSlot && (
        <div className="absolute top-0 left-0 right-0 z-20 p-3">{headerSlot}</div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay={autoPlay}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        data-testid="video-element"
      />

      {manifestData && decryptState.status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full border-3 border-brand-primary border-t-transparent animate-spin" />
            <span className="text-xs text-text-tertiary">Decrypting… {decryptState.progress}%</span>
          </div>
        </div>
      )}
      {!manifestData && isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="w-12 h-12 rounded-full border-3 border-brand-primary border-t-transparent animate-spin"
            data-testid="video-buffering"
          />
        </div>
      )}

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        }}
      >
        <div className="px-3 pb-2 pt-8">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeekSliderChange}
            className="w-full cursor-pointer"
            aria-label="Seek"
            data-testid="seek-slider"
          />

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-8 h-8 flex items-center justify-center text-white hover:text-white/80 cursor-pointer"
                aria-label={isPlaying ? t('pause') : t('play')}
                data-testid="play-pause-btn"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => seekRelative(-10)}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                aria-label={t('skip_back')}
                data-testid="skip-back-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <polyline points="11 17 6 12 11 7" />
                  <text x="16" y="16" fontSize="7" fill="currentColor" stroke="none">
                    10
                  </text>
                </svg>
              </button>

              <button
                onClick={() => seekRelative(10)}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                aria-label={t('skip_forward')}
                data-testid="skip-forward-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <polyline points="13 17 18 12 13 7" />
                  <text x="6" y="16" fontSize="7" fill="currentColor" stroke="none">
                    10
                  </text>
                </svg>
              </button>

              <span className="text-white/80 text-xs tabular-nums" data-testid="time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {isPlaying && (
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-primary/20 text-brand-primary text-[10px] font-medium" data-testid="earning-indicator">
                  <Popcorn className="w-3 h-3" />
                  +5/10m
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <div className="hidden sm:flex items-center gap-1 mr-2">
                <button
                  onClick={toggleMute}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                  aria-label={isMuted ? t('unmute') : t('mute')}
                  data-testid="mute-btn"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                      <line x1="23" y1="9" x2="17" y2="15" stroke="currentColor" strokeWidth="2" />
                      <line x1="17" y1="9" x2="23" y2="15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                      {volume > 0.5 && (
                        <path d="M19 7c1.5 1.5 1.5 8.5 0 10M15.5 9.5c.8.8.8 5.2 0 6" fill="none" stroke="currentColor" strokeWidth="2" />
                      )}
                    </svg>
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.05}
                  onValueChange={handleVolumeSliderChange}
                  className="w-16 cursor-pointer"
                  aria-label="Volume"
                  data-testid="volume-slider"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSettings((p) => !p)}
                  className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                  aria-label={t('settings')}
                  data-testid="settings-btn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {showSettings && (
                  <div
                    className="absolute bottom-10 right-0 rounded-lg p-2 min-w-[120px] z-30 bg-bg-primary border border-border-default"
                    data-testid="settings-menu"
                  >
                    <p className="text-xs font-medium px-2 py-1 mb-1 text-text-tertiary">
                      {t('playback_speed')}
                    </p>
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={cn(
                          'w-full text-left px-2 py-1 text-sm rounded cursor-pointer text-text-primary',
                          speed === playbackRate
                            ? 'font-bold'
                            : 'hover:bg-bg-hover',
                        )}
                        data-testid={`speed-${speed}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={togglePiP}
                className="w-7 h-7 hidden sm:flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                aria-label="Picture in Picture"
                data-testid="pip-btn"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <rect x="12" y="9" width="8" height="6" rx="1" fill="currentColor" opacity="0.4" />
                </svg>
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                aria-label={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
                data-testid="fullscreen-btn"
              >
                {isFullscreen ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showControls && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>
      )}

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatTime(currentTime)}
      </div>
    </div>
  )
}

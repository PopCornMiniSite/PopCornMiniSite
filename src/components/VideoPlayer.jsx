import { useRef, useState, useEffect, useCallback } from 'react'
import Hls from 'hls.js'

export default function VideoPlayer({ src, poster, onTimeUpdate, onEnded, onError, initialTime = 0 }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimer = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const isM3u8 = src.includes('.m3u8')

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialTime) video.currentTime = initialTime
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          hls.destroy()
          if (onError) onError('HLS error')
        }
      })
      return () => hls.destroy()
    } else {
      video.src = src
      if (initialTime) video.currentTime = initialTime
      video.play().catch(() => {})
    }
  }, [src, initialTime, onError])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTime = () => {
      setCurrentTime(video.currentTime)
      if (onTimeUpdate) onTimeUpdate(video.currentTime)
    }
    const onDur = () => setDuration(video.duration)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const onEnd = () => { setPlaying(false); if (onEnded) onEnded() }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDur)
    video.addEventListener('progress', onProgress)
    video.addEventListener('ended', onEnd)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDur)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('ended', onEnd)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [onTimeUpdate, onEnded])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.volume = v
      videoRef.current.muted = v === 0
      setVolume(v)
      setMuted(v === 0)
    }
  }, [])

  const handleSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    if (videoRef.current && duration) {
      videoRef.current.currentTime = pct * duration
    }
  }, [duration])

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!document.fullscreenElement) {
      await el?.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    if (playing) {
      controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [playing])

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video max-h-[60vh] overflow-hidden group cursor-pointer"
      onClick={showControlsTemporarily}
      onMouseMove={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        onClick={(e) => { e.stopPropagation(); togglePlay() }}
      />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-12 pb-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-1 bg-white/20 rounded-full mb-3 group/progress cursor-pointer" onClick={handleSeek}>
          <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
          <div className="absolute h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          <div className="absolute w-3 h-3 bg-primary rounded-full -top-1 shadow-lg" style={{ left: `${progress}%`, marginLeft: '-6px' }} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
              {playing ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button onClick={toggleMute} className="text-white hover:text-primary transition-colors">
              {muted || volume === 0 ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 accent-primary"
            />

            <span className="text-xs text-white/70 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="text-white hover:text-primary transition-colors">
            {fullscreen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useRef, useState, useCallback } from 'react'
import { useFloatingStore } from '@/stores/floatingPlayerStore'

const MIN_W = 180
const MIN_H = 100
const MAX_W = 400
const MAX_H = 260

export function FloatingPlayer() {
  const url = useFloatingStore((s) => s.url)
  const title = useFloatingStore((s) => s.title)
  const playing = useFloatingStore((s) => s.playing)
  const hidden = useFloatingStore((s) => s.hidden)
  const currentTime = useFloatingStore((s) => s.currentTime)
  const duration = useFloatingStore((s) => s.duration)
  const closePlayer = useFloatingStore((s) => s.closePlayer)
  const hidePlayer = useFloatingStore((s) => s.hidePlayer)
  const showPlayer = useFloatingStore((s) => s.showPlayer)
  const setPlaying = useFloatingStore((s) => s.setPlaying)
  const seekTo = useFloatingStore((s) => s.seekTo)
  const setVideoRef = useFloatingStore((s) => s.setVideoRef)

  const elRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ ox: number; oy: number }>({ ox: 0, oy: 0 })
  const resizeRef = useRef<{ ox: number; oy: number; w: number; h: number }>({ ox: 0, oy: 0, w: 0, h: 0 })
  const rafRef = useRef<number>(0)

  const [pos, setPos] = useState({ x: 16, y: 80 })
  const [size, setSize] = useState({ w: 240, h: 150 })
  const [isResizing, setIsResizing] = useState(false)

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return '0:00'
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const togglePlay = useCallback(() => {
    const el = useFloatingStore.getState().videoRef
    if (!el) return
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      el.pause()
      setPlaying(false)
    }
  }, [setPlaying])

  const skip = useCallback((sec: number) => {
    const el = useFloatingStore.getState().videoRef
    if (!el) return
    el.currentTime = Math.max(0, Math.min(el.currentTime + sec, el.duration || 0))
  }, [])

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const el = elRef.current
    if (!el) return
    const src = 'touches' in e ? e.touches[0] : e
    if (!src) return
    const rect = el.getBoundingClientRect()
    dragRef.current = { ox: src.clientX - rect.left, oy: src.clientY - rect.top }

    const onMove = (ev: MouseEvent | TouchEvent) => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const c = 'touches' in ev ? ev.touches[0] : ev
        if (!c || !el) return
        const x = Math.max(0, c.clientX - dragRef.current.ox)
        const y = Math.max(0, c.clientY - dragRef.current.oy)
        el.style.transform = `translate(${x}px, ${y}px)`
        el.style.left = '0px'
        el.style.top = '0px'
      })
    }
    const onUp = () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
      const r = el.getBoundingClientRect()
      setPos({ x: r.left, y: r.top })
      el.style.transform = ''
      el.style.left = `${r.left}px`
      el.style.top = `${r.top}px`
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onUp)
  }, [])

  const onResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    const src = 'touches' in e ? e.touches[0] : e
    if (!src) return
    resizeRef.current = { ox: src.clientX, oy: src.clientY, w: size.w, h: size.h }
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const c = 'touches' in ev ? ev.touches[0] : ev
      if (!c) return
      const dw = c.clientX - resizeRef.current.ox
      const dh = c.clientY - resizeRef.current.oy
      setSize({
        w: Math.max(MIN_W, Math.min(MAX_W, resizeRef.current.w + dw)),
        h: Math.max(MIN_H, Math.min(MAX_H, resizeRef.current.h + dh)),
      })
    }
    const onUp = () => { setIsResizing(false); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onUp)
  }, [size])

  const handleUnhide = useCallback(() => {
    showPlayer()
  }, [showPlayer])

  if (!url) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (hidden) {
    return (
      <div
        className="fixed z-[100] cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-xl border border-white/10"
        style={{
          left: pos.x, top: pos.y,
          background: 'rgba(0,0,0,0.85)',
        }}
        onClick={handleUnhide}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/80 font-medium truncate leading-tight">{title || 'PopCorn'}</p>
          <p className="text-[9px] text-white/40">تشغيل في الخلفية</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={elRef}
      className="fixed z-[100] overflow-hidden rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 select-none"
      style={{
        left: pos.x, top: pos.y,
        width: size.w,
        background: 'rgba(10,10,15,0.95)',
        transition: isResizing ? 'none' : undefined,
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-between px-2 py-1.5 cursor-grab active:cursor-grabbing"
        style={{ background: 'rgba(255,255,255,0.04)' }}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
          <span className="text-[10px] font-bold text-white/70 tracking-wide">PopCorn</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); hidePlayer() }}
            className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="إخفاء (صوت فقط)"
          >
            <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closePlayer() }}
            className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
            title="إغلاق"
          >
            <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      </div>

      {/* Video */}
      <div
          className="relative bg-black cursor-pointer"
        style={{ aspectRatio: '16/9', maxHeight: size.h - 48 }}
        onClick={togglePlay}
      >
        <video
          ref={setVideoRef}
          src={url || undefined}
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
        />
        {/* Center play overlay if paused */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button onClick={togglePlay} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer">
          {playing ? (
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
          ) : (
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <button onClick={() => skip(-10)} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer">
          <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-4.97 1.28-6.4 3.22l-2.1-2.1V16h6.88l-2.4-2.4C9.52 12.11 10.94 11 12.5 11c2.07 0 3.75 1.68 3.75 3.75S14.57 18.5 12.5 18.5c-1.14 0-2.16-.51-2.85-1.32l-1.69 1.69A6.218 6.218 0 0012.5 20.5a6.5 6.5 0 000-13z"/></svg>
        </button>
        <button onClick={() => skip(10)} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer">
          <svg className="w-3.5 h-3.5 text-white/60" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c2.65 0 4.97 1.28 6.4 3.22l2.1-2.1V16h-6.88l2.4-2.4C15.48 12.11 14.06 11 12.5 11c-2.07 0-3.75 1.68-3.75 3.75s1.68 3.75 3.75 3.75c1.14 0 2.16-.51 2.85-1.32l1.69 1.69A6.218 6.218 0 0112.5 20.5a6.5 6.5 0 010-13z"/></svg>
        </button>
        <span className="text-[9px] text-white/40 font-mono ml-auto" dir="ltr">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>

      {/* Progress bar */}
      <div
        className="h-0.5 bg-white/10 cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          seekTo(pct * (duration || 0))
        }}
      >
        <div className="h-full bg-amber-500 transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize z-10"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      >
        <svg className="w-3 h-3 text-white/20 absolute bottom-0.5 right-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 22h-2V2h2v20zM2 22V2h2v20H2zm14-6l-4 4-4-4h3V8h2v8h3z"/></svg>
      </div>
    </div>
  )
}

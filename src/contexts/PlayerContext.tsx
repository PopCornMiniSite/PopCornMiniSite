import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from 'react'

interface PlayerState {
  url: string | null
  title: string
  currentTime: number
  duration: number
  playing: boolean
  hidden: boolean
}

interface PlayerContextValue extends PlayerState {
  showFloating: boolean
  startPlayer: (url: string, title?: string) => void
  closePlayer: () => void
  hidePlayer: () => void
  showPlayer: () => void
  setPlaying: (v: boolean) => void
  seekTo: (t: number) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  getVideoEl: () => HTMLVideoElement | null
  setVideoRef: (el: HTMLVideoElement | null) => void
}

const PlayerContext = createContext<PlayerContextValue>(null!)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [hidden, setHidden] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const startPlayer = useCallback((u: string, t = '') => {
    setUrl(u)
    setTitle(t)
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
    setHidden(false)
  }, [])

  const closePlayer = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute('src')
      videoRef.current.load()
    }
    setUrl(null)
    setTitle('')
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
    setHidden(false)
  }, [])

  const hidePlayer = useCallback(() => {
    setHidden(true)
    if (videoRef.current) videoRef.current.pause()
    setPlaying(false)
  }, [])

  const showPlayerAction = useCallback(() => {
    setHidden(false)
    if (videoRef.current && url) {
      videoRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }, [url])

  const seekTo = useCallback((t: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t
      setCurrentTime(t)
    }
  }, [])

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
  }, [])

  const getVideoEl = useCallback(() => videoRef.current, [])

  const showFloating = url !== null && !hidden

  return (
    <PlayerContext.Provider
      value={{
        url,
        title,
        currentTime,
        duration,
        playing,
        hidden,
        showFloating,
        startPlayer,
        closePlayer,
        hidePlayer,
        showPlayer: showPlayerAction,
        setPlaying,
        seekTo,
        setCurrentTime,
        setDuration,
        getVideoEl,
        setVideoRef,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}

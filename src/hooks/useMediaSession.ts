import { useEffect, useRef, useCallback } from 'react'

interface UseMediaSessionOptions {
  title: string
  artist?: string
  artwork?: string
  onPlay: () => void
  onPause: () => void
  onSeekForward?: () => void
  onSeekBackward?: () => void
  onPrevious?: () => void
  onNext?: () => void
}

export function useMediaSession(options: UseMediaSessionOptions) {
  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  const handlePlay = useCallback(() => optionsRef.current.onPlay(), [])
  const handlePause = useCallback(() => optionsRef.current.onPause(), [])
  const handleSeekForward = useCallback(
    () => optionsRef.current.onSeekForward?.(),
    [],
  )
  const handleSeekBackward = useCallback(
    () => optionsRef.current.onSeekBackward?.(),
    [],
  )
  const handlePrevious = useCallback(
    () => optionsRef.current.onPrevious?.(),
    [],
  )
  const handleNext = useCallback(() => optionsRef.current.onNext?.(), [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const { title, artist, artwork } = optionsRef.current
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: artist ?? 'PopCorn',
      artwork: artwork
        ? [{ src: artwork, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    })

    navigator.mediaSession.setActionHandler('play', handlePlay)
    navigator.mediaSession.setActionHandler('pause', handlePause)
    navigator.mediaSession.setActionHandler('seekforward', handleSeekForward)
    navigator.mediaSession.setActionHandler('seekbackward', handleSeekBackward)
    navigator.mediaSession.setActionHandler('previoustrack', handlePrevious)
    navigator.mediaSession.setActionHandler('nexttrack', handleNext)

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.setActionHandler('seekforward', null)
      navigator.mediaSession.setActionHandler('seekbackward', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
    }
  }, [handlePlay, handlePause, handleSeekForward, handleSeekBackward, handlePrevious, handleNext])
}

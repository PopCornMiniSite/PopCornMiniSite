export async function loadHls(): Promise<{ isSupported: () => boolean; Events: Record<string, string> } | null> {
  if (typeof window === 'undefined') return null
  try {
    const mod = await import(/* @vite-ignore */ 'hls.js')
    return (mod as { default: { isSupported: () => boolean; Events: Record<string, string> } }).default ?? mod as never
  } catch {
    return null
  }
}

export function isHlsSupported(): boolean {
  const video = document.createElement('video')
  return !!(video.canPlayType('application/vnd.apple.mpegurl') || window.MediaSource !== undefined)
}

export async function attachHls(
  url: string,
  video: HTMLVideoElement,
): Promise<{ destroy: () => void } | null> {
  const HlsClass = await loadHls()
  if (!HlsClass) return null

  if (HlsClass.isSupported()) {
    const hls = new (HlsClass as unknown as new () => {
      loadSource: (url: string) => void
      attachMedia: (video: HTMLVideoElement) => void
      on: (event: string, callback: () => void) => void
      destroy: () => void
    })()
    hls.loadSource(url)
    hls.attachMedia(video)
    hls.on(HlsClass.Events.MANIFEST_PARSED ?? 'MANIFEST_PARSED', () => {
      video.play().catch(() => {})
    })
    return {
      destroy: () => {
        hls.destroy()
      },
    }
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    return null
  }

  return null
}

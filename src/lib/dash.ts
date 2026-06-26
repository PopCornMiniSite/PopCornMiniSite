export async function loadDash(): Promise<{ MediaPlayer: () => { create: () => { initialize: (v: HTMLVideoElement, url: string, b: boolean) => void; reset: () => void } } } | null> {
  if (typeof window === 'undefined') return null
  try {
    const mod = await import(/* @vite-ignore */ 'dashjs')
    return (mod as { default: { MediaPlayer: () => { create: () => { initialize: (v: HTMLVideoElement, url: string, b: boolean) => void; reset: () => void } } } }).default ?? mod as never
  } catch {
    return null
  }
}

export async function attachDash(
  url: string,
  video: HTMLVideoElement,
): Promise<{ destroy: () => void } | null> {
  const dashjs = await loadDash()
  if (!dashjs) return null

  const player = dashjs.MediaPlayer().create()
  player.initialize(video, url, false)
  return {
    destroy: () => {
      player.reset()
    },
  }
}

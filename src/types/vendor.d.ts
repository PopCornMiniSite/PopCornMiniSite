declare module 'hls.js' {
  interface HlsConfig {
    maxBufferLength?: number
    maxMaxBufferLength?: number
    enableWorker?: boolean
  }

  class Hls {
    static isSupported(): boolean
    static Events: {
      MANIFEST_PARSED: string
      ERROR: string
      MEDIA_ATTACHED: string
    }

    constructor(config?: HlsConfig)
    loadSource(url: string): void
    attachMedia(video: HTMLVideoElement): void
    on(event: string, callback: (...args: unknown[]) => void): void
    off(event: string, callback: (...args: unknown[]) => void): void
    destroy(): void
    recoverMediaError(): void
  }

  export default Hls
}

declare module 'dashjs' {
  interface MediaPlayer {
    initialize(
      videoElement: HTMLVideoElement,
      source: string,
      autoPlay: boolean,
    ): void
    reset(): void
    on(event: string, callback: (...args: unknown[]) => void): void
  }

  interface MediaPlayerClass {
    create(): MediaPlayer
  }

  const dashjs: {
    MediaPlayer(): MediaPlayerClass
  }

  export default dashjs
}

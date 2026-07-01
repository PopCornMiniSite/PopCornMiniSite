/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.svg' {
  const content: string
  export default content
}

interface TelegramWebAppThemeParams {
  bg_color?: string
  text_color?: string
  hint_color?: string
  link_color?: string
  button_color?: string
  button_text_color?: string
  secondary_bg_color?: string
  header_bg_color?: string
  accent_text_color?: string
  section_bg_color?: string
  section_header_text_color?: string
  subtitle_text_color?: string
  destructive_text_color?: string
}

interface TelegramWebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
}

interface TelegramBackButton {
  show(): void
  hide(): void
  onClick(cb: () => void): void
  offClick(cb: () => void): void
}

interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    user?: TelegramWebAppUser
  }
  themeParams: TelegramWebAppThemeParams
  colorScheme: 'light' | 'dark'
  isDark: boolean
  onEvent(event: string, handler: () => void): void
  offEvent(event: string, handler: () => void): void
  ready(): void
  expand(): void
  close(): void
  shareMessage?(msgId: string, text?: string): void
  openInvoice?(url: string, callback?: (status: string) => void): void
  BackButton: TelegramBackButton
  hapticFeedback: {
    impactOccurred: (style: string) => void
    notificationOccurred: (type: string) => void
    selectionChanged: () => void
  }
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp
  }
}

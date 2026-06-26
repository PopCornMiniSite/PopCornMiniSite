import { useEffect, useState, useCallback } from 'react'

interface TelegramThemeParams {
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

function isColorDark(hex: string): boolean {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function getInitialThemeParams(): TelegramThemeParams | null {
  const tg = window.Telegram?.WebApp
  return tg?.themeParams ?? null
}

export function useTelegramTheme() {
  const [themeParams, setThemeParams] = useState<TelegramThemeParams | null>(getInitialThemeParams)

  const applyTheme = useCallback((tp: TelegramThemeParams) => {
    const root = document.documentElement
    const map: Record<string, string> = {
      '--tg-bg-color': tp.bg_color ?? '',
      '--tg-text-color': tp.text_color ?? '',
      '--tg-hint-color': tp.hint_color ?? '',
      '--tg-link-color': tp.link_color ?? '',
      '--tg-button-color': tp.button_color ?? '',
      '--tg-button-text-color': tp.button_text_color ?? '',
      '--tg-secondary-bg-color': tp.secondary_bg_color ?? '',
      '--tg-header-bg-color': tp.header_bg_color ?? '',
      '--tg-accent-text-color': tp.accent_text_color ?? '',
      '--tg-section-bg-color': tp.section_bg_color ?? '',
      '--tg-section-header-text-color': tp.section_header_text_color ?? '',
      '--tg-subtitle-text-color': tp.subtitle_text_color ?? '',
      '--tg-destructive-text-color': tp.destructive_text_color ?? '',
    }

    for (const [key, value] of Object.entries(map)) {
      if (value) {
        root.style.setProperty(key, value)
      }
    }

    if (tp.bg_color) {
      const dark = isColorDark(tp.bg_color)
      root.style.colorScheme = dark ? 'dark' : 'light'
      root.classList.toggle('dark', dark)
    }
  }, [])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (themeParams) {
      applyTheme(themeParams)
    }

    const handler = () => {
      const newParams = tg?.themeParams ?? null
      if (newParams) {
        setThemeParams(newParams)
        applyTheme(newParams)
      }
    }

    tg?.onEvent('themeChanged', handler)
    return () => {
      tg?.offEvent('themeChanged', handler)
    }
  }, [applyTheme, themeParams])

  return { themeParams, isDark: themeParams?.bg_color ? isColorDark(themeParams.bg_color) : false }
}

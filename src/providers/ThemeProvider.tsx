/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface ThemeContextType {
  theme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'light' })

function isColorDark(hex: string): boolean {
  const color = hex.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}

function bindThemeParamsCssVars() {
  const tg = window.Telegram?.WebApp
  const tp = tg?.themeParams
  if (!tp) return

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
}

function getInitialTheme(): 'light' | 'dark' {
  const tg = window.Telegram?.WebApp
  if (tg?.themeParams?.bg_color) {
    return isColorDark(tg.themeParams.bg_color) ? 'dark' : 'light'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    try {
      bindThemeParamsCssVars()

      const tg = window.Telegram?.WebApp
      if (tg) {
        const handler = () => {
          bindThemeParamsCssVars()
          const tp = tg.themeParams
          if (tp?.bg_color) {
            setTheme(isColorDark(tp.bg_color) ? 'dark' : 'light')
          }
        }
        tg.onEvent('themeChanged', handler)
        return () => {
          tg.offEvent('themeChanged', handler)
        }
      }
    } catch {
      // Outside Telegram — CSS defaults apply
    }
    return undefined
  }, [])

  const value = useMemo(() => ({ theme }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

import { type ReactNode, useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/i18n'

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const dir = i18n.dir(i18n.language)
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language

    const handleLanguageChanged = (lng: string) => {
      const newDir = i18n.dir(lng)
      document.documentElement.dir = newDir
      document.documentElement.lang = lng

      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language: lng, dir: newDir },
        })
      )
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

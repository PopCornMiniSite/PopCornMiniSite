import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import arCommon from './locales/ar/common'
import arNavigation from './locales/ar/navigation'
import arHome from './locales/ar/home'
import arErrors from './locales/ar/errors'
import arDiscover from './locales/ar/discover'
import arMovie from './locales/ar/movie'
import arPlayer from './locales/ar/player'
import arStore from './locales/ar/store'
import arSocial from './locales/ar/social'
import arSettings from './locales/ar/settings'
import arParty from './locales/ar/party'
import arNotifications from './locales/ar/notifications'
import arProfile from './locales/ar/profile'

import enCommon from './locales/en/common'
import enNavigation from './locales/en/navigation'
import enHome from './locales/en/home'
import enErrors from './locales/en/errors'
import enDiscover from './locales/en/discover'
import enMovie from './locales/en/movie'
import enPlayer from './locales/en/player'
import enStore from './locales/en/store'
import enSocial from './locales/en/social'
import enSettings from './locales/en/settings'
import enParty from './locales/en/party'
import enNotifications from './locales/en/notifications'
import enProfile from './locales/en/profile'

import frCommon from './locales/fr/common'
import frNavigation from './locales/fr/navigation'
import frHome from './locales/fr/home'
import frErrors from './locales/fr/errors'
import frDiscover from './locales/fr/discover'
import frMovie from './locales/fr/movie'
import frPlayer from './locales/fr/player'
import frStore from './locales/fr/store'
import frSocial from './locales/fr/social'
import frSettings from './locales/fr/settings'
import frParty from './locales/fr/party'
import frNotifications from './locales/fr/notifications'
import frProfile from './locales/fr/profile'

const resources = {
  ar: {
    common: arCommon,
    navigation: arNavigation,
    home: arHome,
    errors: arErrors,
    discover: arDiscover,
    movie: arMovie,
    player: arPlayer,
    store: arStore,
    social: arSocial,
    settings: arSettings,
    party: arParty,
    notifications: arNotifications,
    profile: arProfile,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    home: enHome,
    errors: enErrors,
    discover: enDiscover,
    movie: enMovie,
    player: enPlayer,
    store: enStore,
    social: enSocial,
    settings: enSettings,
    party: enParty,
    notifications: enNotifications,
    profile: enProfile,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    home: frHome,
    errors: frErrors,
    discover: frDiscover,
    movie: frMovie,
    player: frPlayer,
    store: frStore,
    social: frSocial,
    settings: frSettings,
    party: frParty,
    notifications: frNotifications,
    profile: frProfile,
  },
}

const TelegramDetector = {
  type: 'languageDetector' as const,
  name: 'telegram' as const,
  lookup(): string | undefined {
    try {
      const tg = window.Telegram?.WebApp
      if (tg?.initDataUnsafe?.user?.language_code) {
        return tg.initDataUnsafe.user.language_code
      }
    } catch {
      // Not in Telegram
    }
    return undefined
  },
  cacheUserLanguage(): void {
    // Don't cache — always respect Telegram preference on first load
  },
}

i18n
  .use(TelegramDetector)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'common',
    ns: [
      'common',
      'navigation',
      'home',
      'errors',
      'discover',
      'movie',
      'player',
      'store',
      'social',
      'settings',
      'party',
      'notifications',
      'profile',
    ],
    detection: {
      order: ['telegram', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: { escapeValue: false },
  })

export default i18n

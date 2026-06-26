import { useMemo } from 'react'

interface TelegramState {
  user: {
    id: number
    firstName: string
    lastName?: string
    username?: string
    languageCode?: string
    isPremium?: boolean
  } | null
  initDataRaw: string
  isLoading: boolean
  isMock: boolean
}

function getTelegramState(): TelegramState {
  try {
    const tg = window.Telegram?.WebApp
    if (tg?.initDataUnsafe?.user) {
      const u = tg.initDataUnsafe.user
      return {
        user: {
          id: u.id,
          firstName: u.first_name,
          lastName: u.last_name,
          username: u.username,
          languageCode: u.language_code,
          isPremium: u.is_premium,
        },
        initDataRaw: tg.initData ?? '',
        isLoading: false,
        isMock: false,
      }
    }
  } catch {
    // Not in Telegram
  }
  const user = { id: 5703679073, firstName: 'Dev', lastName: 'User', username: 'devuser', languageCode: 'ar', isPremium: true }
  return {
    user,
    initDataRaw: `dev_${user.id}_${user.firstName}_${user.lastName}_${user.username}`,
    isLoading: false,
    isMock: true,
  }
}

export function useTelegramInit(): TelegramState {
  return useMemo(() => getTelegramState(), [])
}

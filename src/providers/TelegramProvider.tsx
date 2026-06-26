/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from 'react'

interface TelegramUser {
  id: number
  firstName: string
  lastName?: string
  username?: string
  languageCode?: string
  isPremium?: boolean
}

interface TelegramContextType {
  user: TelegramUser | null
  initDataRaw: string
  isLoading: boolean
  isMock: boolean
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  initDataRaw: '',
  isLoading: true,
  isMock: false,
})

const DEV_USER: TelegramUser = {
  id: 5703679073,
  firstName: 'Dev',
  lastName: 'User',
  username: 'devuser',
  languageCode: 'ar',
  isPremium: true,
}

function makeDevInitData(user: TelegramUser): string {
  return `dev_${user.id}_${user.firstName}_${user.lastName ?? ''}_${user.username ?? ''}`
}

function getTelegramState(): TelegramContextType {
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
  return {
    user: DEV_USER,
    initDataRaw: makeDevInitData(DEV_USER),
    isLoading: false,
    isMock: true,
  }
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const state = useMemo(() => getTelegramState(), [])

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}

import { init, backButton, mainButton, miniApp, themeParams, initData, viewport } from '@tma.js/sdk'

let tgApp = null
let tgTheme = null
let tgUser = null
let tgInitData = null
let isRtl = false

export async function initTelegram() {
  try {
    const app = await init({
      acceptCustomStyles: true,
    })
    tgApp = app

    if (miniApp.ready) {
      miniApp.ready()
    }

    tgTheme = themeParams.state()
    tgInitData = initData.state()

    if (tgInitData?.user) {
      tgUser = tgInitData.user
      isRtl = tgInitData.user.language_code === 'ar' || tgInitData.user.language_code === 'he' || tgInitData.user.language_code === 'fa'
    }

    try {
      viewport.expand()
    } catch {}

    return { app, theme: tgTheme, user: tgUser, initData: tgInitData, isRtl }
  } catch (e) {
    console.warn('Telegram SDK init failed (likely running outside Telegram):', e)
    return null
  }
}

export function getTelegramTheme() {
  return tgTheme
}

export function getTelegramUser() {
  return tgUser
}

export function getInitData() {
  return tgInitData
}

export function isRtlMode() {
  return isRtl
}

export function expandApp() {
  try {
    viewport.expand()
  } catch {}
}

export function showBackButton(show = true) {
  try {
    if (show) {
      backButton.show()
    } else {
      backButton.hide()
    }
  } catch {}
}

export function onBackButtonClick(callback) {
  try {
    backButton.onClick(callback)
  } catch {}
}

export function offBackButtonClick(callback) {
  try {
    backButton.offClick(callback)
  } catch {}
}

export function showMainButton(text, onClick) {
  try {
    mainButton.setText(text)
    mainButton.show()
    mainButton.onClick(onClick)
  } catch {}
}

export function hideMainButton() {
  try {
    mainButton.hide()
  } catch {}
}

export function shareTelegram(url, text) {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  window.open(shareUrl, '_blank')
}

export function getTelegramWebApp() {
  return window?.Telegram?.WebApp
}

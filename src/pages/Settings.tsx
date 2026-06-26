import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Globe, Bell, Shield, LogOut } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'

const LANG_KEY = 'pref_language'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()

  const [notifPush, setNotifPush] = useState(() => localStorage.getItem('pref_notif_push') !== 'false')
  const [notifParty, setNotifParty] = useState(() => localStorage.getItem('pref_notif_party') !== 'false')
  const [showOnline, setShowOnline] = useState(() => localStorage.getItem('pref_show_online') !== 'false')
  const [showParty, setShowParty] = useState(() => localStorage.getItem('pref_show_party') !== 'false')

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
  ]

  const handleLang = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem(LANG_KEY, code)
  }

  const toggleLocal = (key: string, setter: (v: boolean) => void, current: boolean) => {
    localStorage.setItem(key, String(!current))
    setter(!current)
  }

  const handleLogout = () => {
    localStorage.removeItem('tg_init_data')
    localStorage.removeItem('auth_token')
    window.location.href = '/'
  }

  return (
    <motion.div
      className="p-4 space-y-4"
      data-testid="settings-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{t('settings:language')}</h3>
        </div>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant={i18n.language === lang.code ? 'primary' : 'outline'}
              onClick={() => handleLang(lang.code)}
              data-testid={`lang-${lang.code}`}
            >
              {lang.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={staggerItem}><Separator /></motion.div>

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{t('settings:notifications')}</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer">
            {t('settings:push_notifications')}
            <input
              type="checkbox"
              checked={notifPush}
              onChange={() => toggleLocal('pref_notif_push', setNotifPush, notifPush)}
              className="rounded border-border-default accent-brand-primary cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer">
            {t('settings:party_notifications')}
            <input
              type="checkbox"
              checked={notifParty}
              onChange={() => toggleLocal('pref_notif_party', setNotifParty, notifParty)}
              className="rounded border-border-default accent-brand-primary cursor-pointer"
            />
          </label>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}><Separator /></motion.div>

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{t('settings:privacy')}</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer">
            {t('settings:show_online')}
            <input
              type="checkbox"
              checked={showOnline}
              onChange={() => toggleLocal('pref_show_online', setShowOnline, showOnline)}
              className="rounded border-border-default accent-brand-primary cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between text-sm text-text-secondary cursor-pointer">
            {t('settings:show_watch_party')}
            <input
              type="checkbox"
              checked={showParty}
              onChange={() => toggleLocal('pref_show_party', setShowParty, showParty)}
              className="rounded border-border-default accent-brand-primary cursor-pointer"
            />
          </label>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}><Separator /></motion.div>

      <motion.div variants={staggerItem}>
        <Button variant="destructive" className="w-full" iconLeft={<LogOut className="w-4 h-4" />} onClick={handleLogout} data-testid="logout-button">
          {t('settings:logout')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
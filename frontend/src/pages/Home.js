import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Home() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, loading, login, setTgUser } = useAuthStore()

  useEffect(() => {
    const tg = window?.Telegram?.WebApp
    if (tg?.initDataUnsafe?.user) {
      const tgUserData = tg.initDataUnsafe.user
      setTgUser(tgUserData)
      login(tgUserData)
    }
  }, [login, setTgUser])

  useEffect(() => {
    if (user && !loading) {
      navigate('/browse', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return <LoadingSpinner size="lg" text={t('common.loading')} />
  }

  const handleTelegramLogin = () => {
    const tg = window?.Telegram?.WebApp
    if (tg?.initDataUnsafe?.user) {
      const tgUserData = tg.initDataUnsafe.user
      setTgUser(tgUserData)
      login(tgUserData)
    } else {
      const mockUser = {
        id: 123456789,
        username: 'demo_user',
        firstName: 'Demo',
        lastName: 'User',
      }
      setTgUser(mockUser)
      login(mockUser)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        width: '96px', height: '96px', borderRadius: '16px',
        backgroundColor: '#E50914', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(229,9,20,0.3)',
      }}>
        <span style={{ color: '#fff', fontSize: '48px', fontWeight: 'bold' }}>P</span>
      </div>

      <h1 style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>{t('app.name')}</h1>
      <p style={{ color: '#6B7280', textAlign: 'center', marginBottom: '32px' }}>{t('home.subtitle')}</p>

      <button onClick={handleTelegramLogin} style={{
        backgroundColor: '#E50914', color: '#fff', fontWeight: 600,
        padding: '14px 24px', borderRadius: '12px', border: 'none',
        fontSize: '16px', cursor: 'pointer', width: '100%', maxWidth: '320px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.127-.087.64-.172 1.133-.59 3.468-2.025 11.787-2.025 11.787s-.163.482-.636.596c-.493.114-.856-.1-.856-.1-.663-.427-4.363-2.868-4.958-3.224a.515.515 0 01-.151-.727c.184-.272.576-.358.576-.358l4.44-2.802c.224-.14.269-.417.049-.586-.22-.17-.488-.117-.488-.117l-6.958 2.305s-.638.216-.924-.23c-.286-.447-.145-.684-.145-.684l.302-.448s2.64-1.114 7.498-3.232c1.662-.724 2.735-1.083 2.735-1.083s.395-.166.396-.166z" />
        </svg>
        {t('home.loginWithTelegram')}
      </button>

      <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '24px', textAlign: 'center' }}>
        {t('home.tagline')}
      </p>
    </div>
  )
}

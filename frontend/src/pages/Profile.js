import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function Profile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, tgUser, watchHistory } = useAuthStore()

  const displayUser = user || tgUser
  const photoUrl = displayUser?.photoUrl || displayUser?.photo_url || displayUser?.avatar_url
  const firstName = displayUser?.firstName || displayUser?.first_name || 'User'
  const lastName = displayUser?.lastName || displayUser?.last_name || ''
  const username = displayUser?.username

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>{t('profile.title')}</h1>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#141428', overflow: 'hidden', flexShrink: 0 }}>
            {photoUrl ? (
              <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{firstName} {lastName}</h2>
            {username && <p style={{ fontSize: '14px', color: '#6B7280' }}>@{username}</p>}
          </div>
        </div>

        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('profile.language')}</h3>
          <LanguageSwitcher />
        </div>

        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('profile.theme')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#141428', borderRadius: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span style={{ fontSize: '14px' }}>{t('profile.dark')}</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('profile.watchHistory')}</h3>
          {watchHistory.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6B7280' }}>{t('common.empty')}</p>
          ) : (
            <div>
              {watchHistory.slice(0, 10).map((item) => (
                <div
                  key={`${item.media_type}-${item.id}-${item.watched_at}`}
                  onClick={() => navigate(`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#141428'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ width: '40px', height: '56px', borderRadius: '8px', backgroundColor: '#141428', overflow: 'hidden', flexShrink: 0 }}>
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>{item.media_type === 'tv' ? 'TV' : 'Movie'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>{t('profile.about')}</h3>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>{t('app.name')} - {t('app.tagline')}</p>
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>{t('profile.version')} 1.0.0</p>
        </div>
      </div>
    </div>
  )
}

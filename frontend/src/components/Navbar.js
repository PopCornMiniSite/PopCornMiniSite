import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const NAV_ITEMS = [
  { path: '/browse', labelKey: 'nav.browse', icon: 'browse' },
  { path: '/search', labelKey: 'nav.search', icon: 'search' },
  { path: '/', labelKey: 'nav.home', icon: 'home' },
  { path: '/chat', labelKey: 'nav.chat', icon: 'chat' },
  { path: '/profile', labelKey: 'nav.profile', icon: 'profile' },
]

const icons = {
  home: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  browse: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  chat: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  profile: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const hideOnPaths = ['/watch/', '/signin', '/signup']
  if (hideOnPaths.some((p) => location.pathname.startsWith(p))) return null

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{
        maxWidth: '512px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-around',
        padding: '4px 8px',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/' && location.pathname === '/') ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', padding: '6px 12px', borderRadius: '8px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: isActive ? '#E50914' : '#6B7280',
                transition: 'color 0.2s',
              }}
            >
              {icons[item.icon]}
              <span style={{ fontSize: '10px', fontWeight: 500 }}>{t(item.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

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
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  browse: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  search: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  profile: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

export default function Navbar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const hideOnPaths = ['/watch/', '/login']
  if (hideOnPaths.some((p) => location.pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/' && location.pathname === '/') ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-white'
              }`}
            >
              {icons[item.icon]}
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

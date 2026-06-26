import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Home, Search, ShoppingBag, Download, Users, User } from 'lucide-react'

const tabs = [
  { id: 'home', path: '/', icon: Home, labelKey: 'home' },
  { id: 'discover', path: '/discover', icon: Search, labelKey: 'discover' },
  { id: 'store', path: '/store', icon: ShoppingBag, labelKey: 'store' },
  { id: 'downloads', path: '/downloads', icon: Download, labelKey: 'downloads' },
  { id: 'community', path: '/community', icon: Users, labelKey: 'community' },
  { id: 'profile', path: '/profile', icon: User, labelKey: 'profile' },
] as const

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('navigation')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              data-testid={`nav-${tab.id}`}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-0 transition-all duration-200 cursor-pointer',
                isActive
                  ? 'text-[#FF6B35] drop-shadow-[0_0_6px_rgba(255,107,53,0.4)]'
                  : 'text-[#8A8F9E] hover:text-[#A0A5B0]'
              )}
              aria-label={t(tab.labelKey)}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight truncate max-w-full">
                {t(tab.labelKey)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

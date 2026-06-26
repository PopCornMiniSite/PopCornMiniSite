import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '@/providers/TelegramProvider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Search, Send } from 'lucide-react'

export function Header() {
  const { user, isMock } = useTelegram()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      const q = formData.get('search') as string
      if (q?.trim()) {
        navigate(`/search?q=${encodeURIComponent(q.trim())}`)
        e.currentTarget.reset()
      }
    },
    [navigate]
  )

  return (
    <header
      className="sticky top-0 z-40 px-4 py-2.5 border-b border-border-subtle"
      style={{
        background: searchFocused
          ? 'var(--color-bg-secondary)'
          : 'rgba(10, 10, 15, 0.85)',
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
      }}
      data-testid="app-header"
    >
      <div className="flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8A5B] shadow-[0_0_12px_rgba(255,107,53,0.3)]">
            <span className="font-display text-sm font-bold text-white leading-none">
              P
            </span>
          </div>
          <span className="font-display font-bold text-base text-text-primary leading-none hidden sm:inline">
            PopCorn
          </span>
        </div>

        {/* Search bar — persistent, glassmorphism */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-md mx-auto"
          role="search"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              name="search"
              type="search"
              placeholder="البحث عن فيلم..."
              aria-label="Search movies"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm text-white placeholder-white/30 bg-white/10 backdrop-blur-md border border-white/10 focus:outline-none focus:border-brand-primary/50 focus:bg-white/15 transition-all duration-300"
            />
          </div>
        </form>

        {/* User avatar */}
        {user && (
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <Avatar className="h-8 w-8 ring-2 ring-border-subtle">
              <AvatarFallback className="text-xs">
                {user.firstName[0]?.toUpperCase() ?? '?'}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header
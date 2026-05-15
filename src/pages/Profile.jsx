import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
      </div>

      <div className="px-4">
        <div className="bg-card rounded-xl p-4 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface overflow-hidden flex-shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{firstName} {lastName}</h2>
            {username && <p className="text-sm text-muted">@{username}</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">{t('profile.language')}</h3>
          <LanguageSwitcher />
        </div>

        <div className="bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">{t('profile.theme')}</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface">
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-sm">{t('profile.dark')}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">{t('profile.watchHistory')}</h3>
          {watchHistory.length === 0 ? (
            <p className="text-sm text-muted">{t('common.empty')}</p>
          ) : (
            <div className="space-y-2">
              {watchHistory.slice(0, 10).map((item) => (
                <div
                  key={`${item.media_type}-${item.id}-${item.watched_at}`}
                  onClick={() => navigate(`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="w-10 h-14 rounded-lg bg-surface overflow-hidden flex-shrink-0">
                    {item.poster_path && (
                      <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted">{item.media_type === 'tv' ? 'TV' : 'Movie'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">{t('profile.about')}</h3>
          <p className="text-sm text-muted">{t('app.name')} - {t('app.tagline')}</p>
          <p className="text-xs text-muted mt-1">{t('profile.version')} 1.0.0</p>
        </div>
      </div>
    </div>
  )
}

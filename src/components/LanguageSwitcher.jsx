import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en'

  const toggleLang = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLang}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-card-hover transition-colors text-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium">{currentLang === 'en' ? 'AR' : 'EN'}</span>
    </button>
  )
}

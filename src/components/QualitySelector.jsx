import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const QUALITIES = [
  { label: '4K', value: '2160p', height: 2160 },
  { label: '1080p', value: '1080p', height: 1080 },
  { label: '720p', value: '720p', height: 720 },
  { label: '480p', value: '480p', height: 480 },
]

export default function QualitySelector({ selected, onSelect, sources = {} }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const availableQualities = QUALITIES.filter((q) => sources[q.value])

  if (availableQualities.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {selected || t('movie.quality')}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-card border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[140px]">
            {availableQualities.map((q) => (
              <button
                key={q.value}
                onClick={() => {
                  onSelect(q.value)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-surface transition-colors ${
                  selected === q.value ? 'text-primary font-medium' : 'text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

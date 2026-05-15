import React, { useState } from 'react'
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
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '8px', fontSize: '14px', color: '#fff',
          border: 'none', cursor: 'pointer',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {selected || t('movie.quality')}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', bottom: '100%', marginBottom: '8px', left: 0, zIndex: 50,
            backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            minWidth: '140px',
          }}>
            {availableQualities.map((q) => (
              <button
                key={q.value}
                onClick={() => { onSelect(q.value); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', fontSize: '14px', color: selected === q.value ? '#E50914' : '#fff',
                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                  fontWeight: selected === q.value ? 500 : 400,
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#141428'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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

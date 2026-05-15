import React from 'react'

export default function LoadingSpinner({ size = 'md', text }) {
  const sizes = {
    sm: { width: 20, height: 20 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
  }
  const s = sizes[size] || sizes.md

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '48px 0' }}>
      <div style={{
        width: s.width,
        height: s.height,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: '#E50914',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      {text && <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>{text}</p>}
    </div>
  )
}

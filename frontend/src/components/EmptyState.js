import React from 'react'
import { useTranslation } from 'react-i18next'

export default function EmptyState({ icon, title, message, action }) {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', padding: '32px', textAlign: 'center' }}>
      {icon || (
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '4px' }}>{title || t('common.empty')}</h3>
      {message && <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px', margin: '0 0 16px 0' }}>{message}</p>}
      {action}
    </div>
  )
}

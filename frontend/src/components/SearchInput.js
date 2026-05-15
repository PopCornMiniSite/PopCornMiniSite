import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function SearchInput({ value, onChange, placeholder, debounceMs = 400 }) {
  const { t } = useTranslation()
  const [localValue, setLocalValue] = useState(value || '')
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (value !== undefined) setLocalValue(value)
  }, [value])

  useEffect(() => {
    const debouncedFn = debounce((val) => {
      if (onChangeRef.current) onChangeRef.current(val)
    }, debounceMs)
    debouncedFn(localValue)
    return debouncedFn
  }, [localValue, debounceMs])

  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#6B7280' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder || t('search.placeholder')}
        style={{
          width: '100%', backgroundColor: '#141428', color: '#fff',
          borderRadius: '12px', padding: '12px 16px 12px 40px',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '16px', outline: 'none', boxSizing: 'border-box',
        }}
        onFocus={(e) => e.target.style.borderColor = '#E50914'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

function debounce(fn, delay) {
  let timer
  const debounced = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
  debounced.cancel = () => { clearTimeout(timer) }
  return debounced
}

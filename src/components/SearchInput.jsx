import { useState, useEffect, useRef } from 'react'
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
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder || t('search.placeholder')}
        className="tg-input pl-10"
      />
      {localValue && (
        <button
          onClick={() => setLocalValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
  debounced.cancel = () => {
    clearTimeout(timer)
  }
  return debounced
}

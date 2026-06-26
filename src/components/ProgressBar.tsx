import { useEffect, useState } from 'react'

interface ProgressBarProps {
  progress: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ progress, size = 'md', showLabel = false, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress))
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimated(clamped))
    return () => cancelAnimationFrame(raf)
  }, [clamped])

  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }
  const labelSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' }

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full ${heights[size]} rounded-full bg-white/10 overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-700 ease-out`}
          style={{ width: `${animated}%` }}
        />
      </div>
      {showLabel && (
        <span className={`${labelSizes[size]} text-text-tertiary mt-0.5 block text-right`}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar
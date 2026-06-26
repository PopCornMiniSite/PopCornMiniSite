import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, iconLeft, iconRight, id, disabled, required, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const hintId = hint ? `${inputId}-hint` : undefined
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full" data-testid="input-field">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-brand-primary ml-0.5" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden="true">
              {iconLeft}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'flex w-full h-10 rounded-lg',
              'bg-bg-tertiary border border-border-default',
              'text-text-primary placeholder:text-text-tertiary',
              'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
              'disabled:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-50',
              'aria-invalid:border-semantic-error aria-invalid:ring-semantic-error/20',
              'text-base',
              iconLeft && 'pl-10',
              iconRight && 'pr-10',
              !iconLeft && !iconRight && 'px-4',
              iconLeft && !iconRight && 'pr-4',
              !iconLeft && iconRight && 'pl-4',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" aria-hidden="true">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-semantic-error flex items-center gap-1" role="alert" data-testid="input-error">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-sm text-text-tertiary" data-testid="input-hint">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }

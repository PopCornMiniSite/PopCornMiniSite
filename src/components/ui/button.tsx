/* eslint-disable react-refresh/only-export-components */
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
    'active:scale-[0.98]',
    'whitespace-nowrap',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-primary text-white rounded-lg',
          'hover:bg-brand-primary-hover',
          'shadow-[0_4px_16px_rgba(255,107,53,0.3)]',
          'hover:shadow-[0_8px_24px_rgba(255,107,53,0.4)]',
        ].join(' '),
        secondary: [
          'bg-bg-tertiary text-text-primary border border-border-default rounded-lg',
          'hover:bg-bg-hover hover:border-border-strong',
          'hover:shadow-md',
        ].join(' '),
        outline: [
          'bg-transparent text-text-primary border-2 border-border-default rounded-lg',
          'hover:bg-bg-hover hover:border-brand-primary',
        ].join(' '),
        ghost: [
          'bg-transparent text-text-secondary rounded-lg',
          'hover:bg-bg-hover hover:text-text-primary',
        ].join(' '),
        destructive: [
          'bg-semantic-error text-white rounded-lg',
          'hover:opacity-90',
          'shadow-[0_4px_16px_rgba(255,71,87,0.3)]',
        ].join(' '),
        premium: [
          'bg-gradient-brand text-white rounded-lg',
          'hover:shadow-[0_0_48px_rgba(255,107,53,0.25)]',
          'border-none',
        ].join(' '),
        glass: [
          'glass text-text-primary rounded-lg',
          'hover:bg-bg-hover/50',
        ].join(' '),
        link: [
          'text-brand-primary underline-offset-4 rounded-none',
          'hover:underline',
        ].join(' '),
      },
      size: {
        xs: 'h-8 px-3 text-xs gap-1.5',
        sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-md',
        md: 'h-10 px-4 text-sm gap-2 rounded-lg',
        lg: 'h-12 px-6 text-base gap-2 rounded-lg',
        xl: 'h-14 px-8 text-lg gap-2.5 rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
        'icon-sm': 'h-8 w-8 rounded-md',
        'icon-lg': 'h-12 w-12 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'relative pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, asChild = false, iconLeft, iconRight, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    const isLoading = loading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, loading }), className)}
        ref={ref}
        disabled={Boolean((disabled ?? false) || isLoading)}
        aria-busy={isLoading || undefined}
        aria-disabled={(disabled || isLoading) || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {!isLoading && iconLeft && <span aria-hidden="true">{iconLeft}</span>}
        {children}
        {!isLoading && iconRight && <span aria-hidden="true">{iconRight}</span>}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

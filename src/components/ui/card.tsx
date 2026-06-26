import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'premium'
  interactive?: boolean
  glow?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, glow = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-xl bg-bg-tertiary border border-border-subtle overflow-hidden',
        'transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
        variant === 'default' && 'bg-bg-tertiary',
        variant === 'glass' && 'glass',
        variant === 'premium' && 'bg-gradient-to-b from-white/[0.03] to-transparent border-transparent',
        interactive && [
          'cursor-pointer',
          'hover:shadow-lg hover:border-brand-primary/30',
          'hover:-translate-y-0.5',
        ],
        glow && 'card-glow',
        'data-[state=active]:scale-[0.98]',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 pt-5 pb-2', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'font-display font-semibold tracking-tight text-text-primary',
        'text-lg sm:text-xl',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-text-secondary text-sm mt-1', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-5 pb-5', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center px-5 pb-5', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

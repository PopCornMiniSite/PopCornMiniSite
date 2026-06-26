import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--tg-hint-color)]/20', className)}
      {...props}
    />
  )
}

export { Skeleton }

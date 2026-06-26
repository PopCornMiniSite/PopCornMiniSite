import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp } from 'lucide-react'
import type { Rating } from '@/types/comment'

interface RatingStarsProps {
  value?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RatingStars({ value = 0, onChange, readonly = false, size = 'md' }: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const { t } = useTranslation()

  const sizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size]

  const displayValue = hoverValue || value

  return (
    <div className="flex items-center gap-1" data-testid="rating-stars">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${sizeClass} transition-colors ${
            star <= displayValue ? 'text-yellow-400' : 'text-muted-foreground/30'
          } ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-300'}`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHoverValue(star)}
          onMouseLeave={() => !readonly && setHoverValue(0)}
          aria-label={`${star} ${t('rating:out_of_10')}`}
          data-testid={`rating-star-${star}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm font-medium">{value}/10</span>
    </div>
  )
}

interface RatingDisplayProps {
  rating: Rating
  onHelpful?: (id: string) => void
}

export function RatingDisplay({ rating, onHelpful }: RatingDisplayProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border border-border p-3 space-y-2" data-testid="rating-display">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{rating.first_name}</span>
          <RatingStars value={rating.rating} readonly size="sm" />
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(rating.created_at).toLocaleDateString()}
        </span>
      </div>

      {rating.review && (
        <p className="text-sm text-muted-foreground">{rating.review}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={() => onHelpful?.(rating.id)}
          className="flex items-center gap-1 hover:text-primary transition-colors"
          disabled={rating.is_helpful}
          data-testid="helpful-button"
        >
          <ThumbsUp className="w-3.5 h-3.5 inline" /> {t('rating:helpful')} ({rating.helpful_count})
        </button>
      </div>
    </div>
  )
}

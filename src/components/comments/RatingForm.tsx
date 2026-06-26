import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateRating } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { RatingStars } from './RatingStars'
import { Separator } from '@/components/ui/separator'

interface RatingFormProps {
  tmdbId: number
  mediaType: 'movie' | 'series'
  onSuccess?: () => void
}

export function RatingForm({ tmdbId, mediaType, onSuccess }: RatingFormProps) {
  const { t } = useTranslation()
  const [score, setScore] = useState(0)
  const [review, setReview] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const createRating = useCreateRating()

  const handleSubmit = async () => {
    if (score === 0) return

    await createRating.mutateAsync({
      tmdb_id: tmdbId,
      media_type: mediaType,
      rating: score,
      review: review.trim() || undefined,
      is_spoiler: hasSpoiler,
    })

    setScore(0)
    setReview('')
    setHasSpoiler(false)
    onSuccess?.()
  }

  return (
    <div className="space-y-4" data-testid="rating-form">
      <h3 className="text-sm font-semibold">{t('rating:write_review')}</h3>

      <RatingStars value={score} onChange={setScore} size="lg" />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder={t('rating:review_placeholder')}
        className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        rows={3}
        maxLength={2000}
        data-testid="rating-review-input"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={hasSpoiler}
            onChange={(e) => setHasSpoiler(e.target.checked)}
            className="rounded border-border"
          />
          {t('rating:contains_spoiler')}
        </label>
        <span className="text-xs text-muted-foreground">{review.length}/2000</span>
      </div>

      <Separator />

      <Button
        onClick={handleSubmit}
        disabled={score === 0 || createRating.isPending}
        className="w-full"
        data-testid="submit-rating"
      >
        {createRating.isPending ? t('common:loading') : t('rating:submit')}
      </Button>
    </div>
  )
}

import { useState } from 'react'
import { useCreateRating } from '@/lib/api'
import { Star } from 'lucide-react'

interface RatingSectionProps {
  tmdbId: number
  mediaType: 'movie' | 'series'
  userRating?: number
  averageRating?: number
  ratingsCount?: number
}

export function RatingSection({ tmdbId, mediaType, userRating: initialRating, averageRating, ratingsCount }: RatingSectionProps) {
  const [hovered, setHovered] = useState(0)
  const [selected, setSelected] = useState(initialRating ?? 0)
  const [review, setReview] = useState('')
  const [isSpoiler, setIsSpoiler] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { mutate: submitRating, isPending } = useCreateRating()

  const handleRate = (rating: number) => {
    setSelected(rating)
    setShowForm(true)
  }

  const handleSubmit = () => {
    submitRating({
      tmdb_id: tmdbId,
      media_type: mediaType,
      rating: selected,
      review: review.trim() || undefined,
      is_spoiler: isSpoiler,
    }, {
      onSuccess: () => {
        setShowForm(false)
        setReview('')
        setIsSpoiler(false)
      },
    })
  }

  return (
    <section className="mt-10 px-4">
      <h3 className="text-lg font-bold font-display text-text-primary mb-3">التقييم</h3>

      {averageRating !== undefined && (
        <div className="flex items-center gap-3 mb-4 bg-bg-tertiary rounded-xl px-4 py-3">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold text-text-primary">{averageRating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-text-tertiary">{ratingsCount ?? 0} تقييم</span>
        </div>
      )}

      <div className="flex gap-1 mb-3" dir="ltr">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-all ${
                star <= (hovered || selected)
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]'
                  : 'text-border-strong'
              }`}
            />
          </button>
        ))}
      </div>

      {showForm && (
        <div className="space-y-2">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="اكتب مراجعة (اختياري)..."
            className="w-full bg-bg-tertiary rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-none outline-none border border-border-subtle focus:border-brand-primary/50 transition-colors min-h-[60px]"
            rows={2}
          />
          <label className="flex items-center gap-1.5 text-xs text-text-tertiary cursor-pointer">
            <input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} className="accent-brand-primary" />
            يحتوي على حرق
          </label>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={isPending}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-hover disabled:opacity-40 transition-all cursor-pointer">
              {isPending ? '...' : 'إرسال التقييم'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl bg-bg-tertiary text-sm text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default RatingSection
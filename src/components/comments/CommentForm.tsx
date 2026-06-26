import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateComment } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface CommentFormProps {
  tmdbId: number
  mediaType: 'movie' | 'series'
  parentId?: string
  onSuccess?: () => void
  autoFocus?: boolean
  placeholder?: string
}

export function CommentForm({
  tmdbId,
  mediaType,
  parentId,
  onSuccess,
  autoFocus = false,
  placeholder,
}: CommentFormProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [hasSpoiler, setHasSpoiler] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const createComment = useCreateComment()
  const lastSubmitTime = useRef(0)

  const handleSubmit = useCallback(async () => {
    const now = Date.now()
    if (now - lastSubmitTime.current < 30000) return
    if (!content.trim()) return

    lastSubmitTime.current = now

    await createComment.mutateAsync({
      tmdb_id: tmdbId,
      media_type: mediaType,
      content: content.trim(),
      is_spoiler: hasSpoiler,
      parent_id: parentId,
    })

    setContent('')
    setHasSpoiler(false)
    onSuccess?.()
  }, [content, hasSpoiler, tmdbId, mediaType, parentId, onSuccess, createComment])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }

  return (
    <div className="space-y-2" data-testid="comment-form">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          handleInput()
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? t('comments:write_comment')}
        className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        rows={2}
        maxLength={1000}
        autoFocus={autoFocus}
        data-testid="comment-input"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={hasSpoiler}
              onChange={(e) => setHasSpoiler(e.target.checked)}
              className="rounded border-border"
            />
            {t('comments:contains_spoiler')}
          </label>
          <span className="text-xs text-muted-foreground">{content.length}/1000</span>
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || createComment.isPending}
          data-testid="submit-comment"
        >
          {createComment.isPending ? t('common:loading') : t('comments:post')}
        </Button>
      </div>
    </div>
  )
}

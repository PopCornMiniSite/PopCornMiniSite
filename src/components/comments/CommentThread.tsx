import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CommentSort } from '@/types/comment'
import { useComments, useReportComment } from '@/lib/api'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { Separator } from '@/components/ui/separator'

interface CommentThreadProps {
  tmdbId: number
  mediaType: 'movie' | 'series'
}

export function CommentThread({ tmdbId, mediaType }: CommentThreadProps) {
  const { t } = useTranslation()
  const [sort, setSort] = useState<CommentSort>('newest')
  const { data, isLoading } = useComments(tmdbId, mediaType, sort)
  const { mutate: reportComment } = useReportComment()
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const comments = data?.data ?? []

  return (
    <div className="space-y-4" data-testid="comment-thread">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('comments:title')}</h3>
        <div className="flex gap-2">
          {(['newest', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-1 rounded-full transition-colors ${
                sort === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              data-testid={`sort-${s}`}
            >
              {t(`comments:sort_${s}`)}
            </button>
          ))}
        </div>
      </div>

      <CommentForm
        tmdbId={tmdbId}
        mediaType={mediaType}
        onSuccess={() => setReplyTo(null)}
      />

      <Separator />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          {t('comments:no_comments')}
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                onReply={setReplyTo}
                onReport={(id) => {
                  if (window.confirm('هل تريد الإبلاغ عن هذا التعليق؟')) {
                    reportComment({ commentId: String(id), request: {} as any })
                  }
                }}
              />
              {replyTo === comment.id && (
                <div className="ml-8 mt-2">
                  <CommentForm
                    tmdbId={tmdbId}
                    mediaType={mediaType}
                    parentId={comment.id}
                    onSuccess={() => setReplyTo(null)}
                    autoFocus
                    placeholder={t('comments:reply_to', { name: comment.first_name })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

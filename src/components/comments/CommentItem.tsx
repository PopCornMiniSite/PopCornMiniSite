import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, ThumbsDown, MessageCircle, Flag } from 'lucide-react'
import type { Comment as CommentType } from '@/types/comment'
import { useLikeComment } from '@/lib/api'
import { cn } from '@/lib/utils'

interface CommentItemProps {
  comment: CommentType
  isReply?: boolean
  onReply?: (parentId: string) => void
  onReport?: (commentId: string) => void
}

export function CommentItem({ comment, isReply = false, onReply, onReport }: CommentItemProps) {
  const { t } = useTranslation()
  const [showSpoiler, setShowSpoiler] = useState(false)
  const likeComment = useLikeComment()

  const handleLike = (type: 'like' | 'dislike') => {
    likeComment.mutate({ commentId: comment.id, request: { type } })
  }

  const timeAgo = getTimeAgo(comment.created_at)

  return (
    <div
      className={cn(
        'rounded-lg border border-border p-3',
        isReply && 'ml-8 border-l-2 border-l-primary/20',
      )}
      data-testid={isReply ? 'comment-reply' : 'comment-item'}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {comment.first_name?.charAt(0) ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{comment.first_name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
      </div>

      <div className="mb-2">
        {comment.is_spoiler && !showSpoiler ? (
          <div className="relative">
            <div className="blur-md select-none text-sm text-muted-foreground">
              {comment.content}
            </div>
            <button
              onClick={() => setShowSpoiler(true)}
              className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary hover:underline"
              data-testid="show-spoiler"
            >
              {t('comments:show_spoiler')}
            </button>
          </div>
        ) : (
          <p className="text-sm">{comment.content}</p>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => handleLike('like')}
          className={cn(
            'flex items-center gap-1 transition-colors',
            comment.user_like_type === 'like' ? 'text-primary' : 'text-muted-foreground hover:text-primary',
          )}
          data-testid="like-button"
        >
          <ThumbsUp className="w-3.5 h-3.5 inline" /> {comment.likes_count}
        </button>

        <button
          onClick={() => handleLike('dislike')}
          className={cn(
            'flex items-center gap-1 transition-colors',
            comment.user_like_type === 'dislike' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive',
          )}
          data-testid="dislike-button"
        >
          <ThumbsDown className="w-3.5 h-3.5 inline" /> {comment.dislikes_count}
        </button>

        {!isReply && onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-muted-foreground hover:text-primary transition-colors"
            data-testid="reply-button"
          >
            <MessageCircle className="w-3.5 h-3.5 inline" /> {t('comments:reply')}
          </button>
        )}

        {onReport && (
          <button
            onClick={() => onReport(comment.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
            data-testid="report-button"
          >
            <Flag className="w-3.5 h-3.5 inline" /> {t('comments:report')}
          </button>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return `${Math.floor(days / 30)}mo`
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

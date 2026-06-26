import { useState } from 'react'
import { useComments, useCreateComment } from '@/lib/api'
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react'

interface CommentsSectionProps {
  tmdbId: number
  mediaType: 'movie' | 'series'
}

interface CommentItemProps {
  comment: import('@/types/comment').Comment
  onReply?: (id: number, name: string) => void
}

function CommentRow({ comment, onReply }: CommentItemProps) {
  const [likes, setLikes] = useState(comment.likes_count)
  const [dislikes, setDislikes] = useState(comment.dislikes_count)
  const [userAction, setUserAction] = useState<'like' | 'dislike' | null>(comment.user_like_type ?? null)

  const handleVote = (type: 'like' | 'dislike') => {
    if (userAction === type) {
      setUserAction(null)
      if (type === 'like') setLikes((l) => l - 1)
      else setDislikes((d) => d - 1)
    } else {
      if (userAction === 'like') setLikes((l) => l - 1)
      if (userAction === 'dislike') setDislikes((d) => d - 1)
      setUserAction(type)
      if (type === 'like') setLikes((l) => l + 1)
      else setDislikes((d) => d + 1)
    }
  }

  const dateStr = new Date(comment.created_at).toLocaleDateString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <div className="group">
      <div className="flex gap-2.5">
        <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-primary">
          {comment.first_name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-text-primary">{comment.first_name}</span>
            {comment.is_verified && (
              <span className="text-[10px] px-1 py-px rounded bg-brand-primary/20 text-brand-primary text-xs">✔</span>
            )}
            <span className="text-[11px] text-text-tertiary">{dateStr}</span>
          </div>

          {comment.is_spoiler ? (
            <SpoilerText content={comment.content} />
          ) : (
            <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5">
            <button onClick={() => handleVote('like')}
              className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${userAction === 'like' ? 'text-brand-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
              <ThumbsUp className="w-3 h-3" /> {likes > 0 && <span>{likes}</span>}
            </button>
            <button onClick={() => handleVote('dislike')}
              className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${userAction === 'dislike' ? 'text-semantic-error' : 'text-text-tertiary hover:text-text-secondary'}`}>
              <ThumbsDown className="w-3 h-3" /> {dislikes > 0 && <span>{dislikes}</span>}
            </button>
              {onReply && (
              <button onClick={() => onReply(Number(comment.id), comment.first_name)}
                className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer">
                رد
              </button>
            )}
          </div>

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 mr-4 pr-3 border-r border-border-subtle space-y-2">
              {(comment.replies as import('@/types/comment').Comment[]).map((r) => (
                <CommentRow key={r.id} comment={r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SpoilerText({ content }: { content: string }) {
  const [show, setShow] = useState(false)
  if (show) return <p className="text-sm text-text-secondary leading-relaxed">{content}</p>
  return (
    <button onClick={() => setShow(true)}
      className="text-sm text-text-tertiary italic bg-bg-tertiary rounded px-2 py-1 w-full text-left cursor-pointer hover:bg-bg-hover transition-colors">
      ⚠ انقر لكشف المحتوى (قد يحتوي حرق)
    </button>
  )
}

export function CommentsSection({ tmdbId, mediaType }: CommentsSectionProps) {
  const [page, setPage] = useState(1)
  const [text, setText] = useState('')
  const [spoiler, setSpoiler] = useState(false)

  const { data, isLoading } = useComments(tmdbId, mediaType, 'newest', page)
  const { mutate: create, isPending } = useCreateComment()

  const comments = data?.data ?? []
  const total = data?.items?.total ?? 0
  const hasMore = data?.items?.has_more ?? false

  const handlePost = () => {
    if (!text.trim() || isPending) return
    create({ tmdb_id: tmdbId, media_type: mediaType, content: text.trim(), is_spoiler: spoiler },
      { onSuccess: () => { setText(''); setSpoiler(false) } }
    )
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 px-4 mb-4">
        <MessageSquare className="w-5 h-5 text-brand-primary" />
        <h3 className="text-lg font-bold font-display text-text-primary">التعليقات</h3>
        {total > 0 && <span className="text-sm text-text-tertiary">({total})</span>}
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder="اكتب تعليقك..."
            className="flex-1 bg-bg-tertiary rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary resize-none outline-none border border-border-subtle focus:border-brand-primary/50 transition-colors min-h-[44px]"
            rows={2} />
          <button onClick={handlePost} disabled={!text.trim() || isPending}
            className="self-end px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
            {isPending ? '...' : 'نشر'}
          </button>
        </div>
        <label className="flex items-center gap-1.5 mt-1.5 text-xs text-text-tertiary cursor-pointer">
          <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="accent-brand-primary" />
          يحتوي على حرق
        </label>
      </div>

      <div className="px-4 space-y-4">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bg-tertiary" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-bg-tertiary rounded" />
                  <div className="h-4 w-full bg-bg-tertiary rounded" />
                  <div className="h-3 w-16 bg-bg-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-text-tertiary py-8 text-sm">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        ) : (
          comments.map((c) => <CommentRow key={c.id} comment={c} />)
        )}

        {hasMore && (
          <div className="text-center pt-2">
            <button onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2 rounded-xl bg-bg-tertiary text-sm text-text-secondary hover:bg-bg-hover transition-colors cursor-pointer">
              عرض المزيد
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default CommentsSection
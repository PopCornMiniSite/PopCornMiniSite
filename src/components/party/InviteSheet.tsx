import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, Copy, Share2 } from 'lucide-react'

interface InviteSheetProps {
  open: boolean
  onClose: () => void
  roomCode: string
  shareLink: string
}

export function InviteSheet({ open, onClose, roomCode, shareLink }: InviteSheetProps) {
  const { t } = useTranslation()
  const { copied, copy } = useCopyToClipboard()

  const handleShare = () => {
    if (window.Telegram?.WebApp?.shareMessage) {
      window.Telegram.WebApp.shareMessage(roomCode, shareLink)
    } else {
      copy(shareLink)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="invite-sheet">
        <DialogHeader>
          <DialogTitle>{t('party:invite_friends')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">{t('party:room_code')}</p>
            <p className="text-2xl font-mono font-bold tracking-widest">{roomCode}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => copy(roomCode)}
              data-testid="copy-code"
            >
              {copied ? <Check className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />} {t('party:copy_code')}
            </Button>
            <Button className="flex-1" onClick={handleShare} data-testid="share-link">
              <Share2 className="w-4 h-4 inline" /> {t('party:share_link')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

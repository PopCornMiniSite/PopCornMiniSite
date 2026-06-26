import { useTranslation } from 'react-i18next'
import { usePartyStore } from '@/stores/partyStore'
import { useCopyToClipboard } from '@/hooks/useLocalStorage'
import { Button } from '@/components/ui/button'
import { Check, Copy, Share2 } from 'lucide-react'

interface PartyHeaderProps {
  onInvite?: () => void
  onClose?: () => void
}

export function PartyHeader({ onInvite, onClose }: PartyHeaderProps) {
  const { t } = useTranslation()
  const { roomCode, role } = usePartyStore()
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="flex items-center justify-between p-4 border-b border-border" data-testid="party-header">
      <div>
        <h2 className="text-lg font-semibold">{t('party:watch_party')}</h2>
        {roomCode && (
          <p className="text-xs text-muted-foreground">
            {t('party:room')}: {roomCode}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => roomCode && copy(roomCode)}
          data-testid="copy-room-code"
        >
          {copied ? <Check className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />}
        </Button>

        <Button variant="outline" size="sm" onClick={onInvite} data-testid="invite-button">
          <Share2 className="w-4 h-4 inline" /> {t('party:invite')}
        </Button>

        {role === 'leader' && onClose && (
          <Button variant="destructive" size="sm" onClick={onClose} data-testid="close-party">
            {t('party:end_party')}
          </Button>
        )}
      </div>
    </div>
  )
}

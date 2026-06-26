import { useTranslation } from 'react-i18next'
import { usePartyStore } from '@/stores/partyStore'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface ReadyButtonProps {
  onReady?: () => void
}

export function ReadyButton({ onReady }: ReadyButtonProps) {
  const { t } = useTranslation()
  const { role, participants } = usePartyStore()

  if (role !== 'follower') return null

  const myParticipant = participants.find((p) => p.role === 'follower')
  const isReady = myParticipant?.is_ready ?? false

  return (
    <Button
      onClick={onReady}
      variant={isReady ? 'outline' : 'primary'}
      className="w-full"
      data-testid="ready-button"
    >
      {isReady ? <><Check className="w-4 h-4 inline" /> {t('party:ready')}</> : t('party:mark_ready')}
    </Button>
  )
}

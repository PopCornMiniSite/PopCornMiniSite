import { useTranslation } from 'react-i18next'
import { usePartyStore } from '@/stores/partyStore'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

interface ParticipantListProps {
  onKick?: (userId: string) => void
}

export function ParticipantList({ onKick }: ParticipantListProps) {
  const { t } = useTranslation()
  const { participants, role } = usePartyStore()

  return (
    <div className="space-y-2" data-testid="participant-list">
      <h3 className="text-sm font-semibold">
        {t('party:participants')} ({participants.length})
      </h3>

      <div className="space-y-2">
        {participants.map((p) => (
          <div
            key={p.user_id}
            className="flex items-center justify-between rounded-lg border border-border p-2"
            data-testid="participant-item"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                {p.name.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-medium">{p.name}</span>
                {p.role === 'leader' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t('party:leader')}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${p.is_online ? 'bg-green-500' : 'bg-gray-400'}`} />
              {p.is_ready && (
                <Badge variant="outline" className="text-xs">
                  <Check className="w-3 h-3 inline" /> {t('party:ready')}
                </Badge>
              )}
              {role === 'leader' && p.role !== 'leader' && onKick && (
                <button
                  onClick={() => onKick(p.user_id)}
                  className="text-xs text-destructive hover:underline"
                  data-testid={`kick-button-${p.user_id}`}
                >
                  {t('party:kick')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

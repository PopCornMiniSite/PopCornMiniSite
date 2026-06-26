import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { PartyHeader } from '@/components/party/PartyHeader'
import { ParticipantList } from '@/components/party/ParticipantList'
import { PartyChat } from '@/components/party/PartyChat'
import { InviteSheet } from '@/components/party/InviteSheet'
import { ReadyButton } from '@/components/party/ReadyButton'
import { usePartyStore } from '@/stores/partyStore'
import { usePartyWebSocket } from '@/hooks/usePartyWebSocket'
import { useSearchQuery } from '@/lib/api'
import { useDebounce } from '@/hooks/useLocalStorage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Play, Search, Film, Tv, Mic, MicOff, Phone, PhoneOff,
} from 'lucide-react'

export default function WatchPartyPage() {
  const { t } = useTranslation()
  const { partyId } = useParams<{ partyId: string }>()
  const navigate = useNavigate()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [searchQuery, setSearchQuery] = useState('')
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceMuted, setVoiceMuted] = useState(false)

  const store = usePartyStore()
  const { sendChat, sendReady, isConnected } = usePartyWebSocket(partyId, !!partyId)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const { data: searchResults } = useSearchQuery(debouncedSearch, 'all')

  const handleSendMessage = useCallback((content: string) => {
    sendChat(content)
  }, [sendChat])

  const handleEndParty = useCallback(() => {
    store.reset()
    navigate('/community')
  }, [store, navigate])

  const handleReady = useCallback(() => {
    sendReady(true)
  }, [sendReady])

  const handleSelectMedia = (item: any) => {
    navigate(`/${item.media_type}/${item.tmdb_id}`)
  }

  const toggleVoice = () => {
    if (!voiceActive) {
      setVoiceActive(true)
      setVoiceMuted(false)
    } else {
      setVoiceActive(false)
      setVoiceMuted(false)
    }
  }

  const participants = store.participants

  return (
    <div className="flex flex-col h-screen" data-testid="watch-party-page">
      <PartyHeader
        onInvite={() => setInviteOpen(true)}
        onClose={handleEndParty}
      />

      {/* Connection status */}
      {!isConnected && (
        <div className="px-4 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20">
          <p className="text-xs text-yellow-600 text-center">
            {t('party:connecting', { defaultValue: 'جاري الاتصال...' })}
          </p>
        </div>
      )}
      {isConnected && (
        <div className="px-4 py-1 bg-green-500/5 border-b border-green-500/10">
          <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
            {t('party:connected', { defaultValue: 'متصل' })}
          </p>
        </div>
      )}

      {/* Search bar */}
      <div className="px-4 pt-2">
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('party:search_placeholder', { defaultValue: 'ابحث عن فيلم أو مسلسل...' })}
            iconLeft={<Search className="w-4 h-4" />}
            className="text-sm"
          />
          {debouncedSearch && searchResults && searchResults.items.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-xl bg-bg-primary border border-border-subtle shadow-xl divide-y divide-border-subtle">
              {searchResults.items.slice(0, 6).map((item: any) => (
                <button
                  key={`${item.media_type}-${item.tmdb_id}`}
                  onClick={() => handleSelectMedia(item)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-bg-hover transition-colors text-right cursor-pointer"
                >
                  <div className="w-9 h-13 rounded-lg overflow-hidden bg-bg-hover flex-shrink-0 border border-border-subtle">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.media_type === 'movie' ? <Film className="w-4 h-4 text-brand-primary" /> : <Tv className="w-4 h-4 text-brand-primary" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-xs font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-[10px] text-text-tertiary">{item.media_type === 'movie' ? t('party:movie') : t('party:series')}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video area placeholder */}
      <div className="flex-1 flex items-center justify-center bg-bg-primary border-b border-border-subtle relative min-h-[120px]">
        {participants.length > 1 ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-bg-tertiary mx-auto flex items-center justify-center border-2 border-brand-primary/30 mb-2">
              <Play className="w-6 h-6 text-brand-primary" />
            </div>
            <p className="text-sm font-medium text-text-primary">{t('party:watching_together')}</p>
            <p className="text-xs text-text-tertiary">{participants.length} {t('party:participants')}</p>
          </div>
        ) : (
          <div className="text-center px-4">
            <p className="text-sm text-text-tertiary">{t('party:waiting_for_others', { defaultValue: 'انتظر انضمام الآخرين أو ابحث عن عمل للمشاهدة' })}</p>
            <p className="text-xs text-text-tertiary mt-1">{t('party:invite_hint', { defaultValue: 'ادعُ أصدقاءك باستخدام زر الدعوة' })}</p>
          </div>
        )}
      </div>

      {/* Voice call bar */}
      {voiceActive && (
        <div className="px-4 py-2 bg-brand-primary/5 border-b border-brand-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {participants.slice(0, 5).map((p, i) => (
                <div key={p.user_id} className={`w-7 h-7 rounded-full bg-brand-primary/20 border-2 border-bg-primary flex items-center justify-center text-[10px] font-bold text-brand-primary ${i > 0 ? '-mr-1' : ''}`}>
                  {p.name.charAt(0)}
                </div>
              ))}
            </div>
            <span className="text-xs text-text-secondary">{t('party:voice_active', { defaultValue: 'محادثة صوتية' })}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setVoiceMuted(!voiceMuted)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${voiceMuted ? 'bg-semantic-error/20 text-semantic-error' : 'bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}
            >
              {voiceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleVoice}
              className="w-8 h-8 rounded-full bg-semantic-error/20 text-semantic-error flex items-center justify-center hover:bg-semantic-error/30 transition-colors cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs: Chat / Participants */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-4">
          <TabsTrigger value="chat">{t('party:chat')}</TabsTrigger>
          <TabsTrigger value="participants">
            {t('party:participants')}
            {participants.length > 0 && <span className="mr-1 text-xs opacity-60">({participants.length})</span>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
          <PartyChat onSendMessage={handleSendMessage} />
        </TabsContent>

        <TabsContent value="participants" className="p-4 overflow-y-auto flex-1">
          <ParticipantList />
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              iconLeft={voiceActive ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              onClick={toggleVoice}
            >
              {voiceActive ? t('party:end_call', { defaultValue: 'إنهاء المكالمة' }) : t('party:start_call', { defaultValue: 'بدء محادثة صوتية' })}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Ready button for followers */}
      {store.role === 'follower' && (
        <div className="p-4 border-t border-border-subtle">
          <ReadyButton onReady={handleReady} />
        </div>
      )}

      <InviteSheet
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roomCode={partyId ?? ''}
        shareLink={`https://t.me/PopCornMinibot/start?startapp=party_${partyId}`}
      />
    </div>
  )
}
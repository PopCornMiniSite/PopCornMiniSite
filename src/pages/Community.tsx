import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { usePublicParties, useFriendParties, useCurrentUser, useJoinParty } from '@/lib/api'
import { useTelegram } from '@/providers/TelegramProvider'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { PartyPopper, Link2, Users, Globe, Shuffle, Sparkles } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'

export default function CommunityPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { initDataRaw } = useTelegram()
  const { data: user } = useCurrentUser(initDataRaw || null)
  const { data: publicParties, isLoading: loadingParties } = usePublicParties()
  const { data: friendParties } = useFriendParties(user?.id ?? 0)
  const joinParty = useJoinParty()
  const [tilmilLoading, setTilmilLoading] = useState(false)

  const tilmilMatch = async () => {
    setTilmilLoading(true)
    try {
      const parties = publicParties ?? []
      if (parties.length === 0) {
        navigate('/party/create')
        return
      }
      const randomParty = parties[Math.floor(Math.random() * parties.length)]
      const roomCode = (randomParty as any).room_code
      if (roomCode) {
        await joinParty.mutateAsync({ room_code: roomCode }).catch(() => {})
        navigate(`/party/${roomCode}`)
      }
    } catch {
      navigate('/party/create')
    } finally {
      setTilmilLoading(false)
    }
  }

  return (
    <motion.div
      className="p-4 space-y-6"
      data-testid="community-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* Tilmil - Quick Match */}
      <motion.div variants={staggerItem}>
        <button
          onClick={tilmilMatch}
          disabled={tilmilLoading}
          className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary via-orange-500 to-amber-500 p-5 text-white text-right cursor-pointer hover:brightness-110 transition-all disabled:opacity-60 group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold font-display">{t('party:tilmil', { defaultValue: 'تليميل' })}</p>
                <p className="text-xs text-white/70">{t('party:tilmil_desc', { defaultValue: 'مطابقة سريعة · انضم لغرفة عشوائية' })}</p>
              </div>
            </div>
            <Sparkles className="w-8 h-8 text-yellow-200 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </button>
      </motion.div>

      <motion.div className="flex gap-2" variants={staggerItem}>
        <Button onClick={() => navigate('/party/create')} iconLeft={<PartyPopper className="h-4 w-4" />} data-testid="create-party-btn">
          {t('party:create')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/party/join')} iconLeft={<Link2 className="h-4 w-4" />} data-testid="join-party-btn">
          {t('party:join')}
        </Button>
      </motion.div>

      {friendParties && friendParties.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-text-primary">{t('social:friend_parties')}</h3>
          </div>
          <div className="space-y-2">
            {friendParties.map((party: any) => (
              <div
                key={party.id}
                className="flex items-center justify-between rounded-xl bg-bg-tertiary border border-border-subtle p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{party.title}</p>
                  <p className="text-xs text-text-tertiary">
                    {(party as any).member_count ?? 0} {t('party:participants')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await joinParty.mutateAsync({ room_code: (party as any).room_code })
                      navigate(`/party/${(party as any).room_code}`)
                    } catch {}
                  }}
                >
                  {t('party:join')}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-text-primary">{t('social:public_parties')}</h3>
        </div>
        {loadingParties ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-bg-tertiary animate-pulse" />
            ))}
          </div>
        ) : publicParties && publicParties.length > 0 ? (
          <div className="space-y-2">
            {publicParties.map((party: any) => (
              <div
                key={party.id}
                className="flex items-center justify-between rounded-xl bg-bg-tertiary border border-border-subtle p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{party.title}</p>
                  <p className="text-xs text-text-tertiary">
                    {party.member_count ?? 0} {t('party:participants')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await joinParty.mutateAsync({ room_code: party.room_code })
                      navigate(`/party/${party.room_code}`)
                    } catch {}
                  }}
                >
                  {t('party:join')}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-tertiary text-center py-4">
            {t('social:no_parties')}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
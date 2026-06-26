import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useJoinParty } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { staggerContainer, staggerItem } from '@/components/ui/motion'
import { Hash, Key } from 'lucide-react'

export default function PartyJoinPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { code: urlCode } = useParams<{ code: string }>()
  const joinParty = useJoinParty()

  const [roomCode, setRoomCode] = useState(urlCode ?? '')
  const [password, setPassword] = useState('')

  const handleJoin = async () => {
    if (!roomCode.trim()) return

    try {
      const result = await joinParty.mutateAsync({
        room_code: roomCode.trim().toUpperCase(),
        password: password || undefined,
      })
      const rc = (result.data as any).room_code
      navigate(`/party/${rc}`)
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <motion.div
      className="p-4 space-y-4"
      data-testid="party-join-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div className="space-y-2" variants={staggerItem}>
        <label className="text-sm font-medium text-text-primary">{t('party:room_code')}</label>
        <Input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder={t('party:enter_room_code')}
          iconLeft={<Hash className="w-4 h-4" />}
          className="text-center text-lg tracking-widest font-mono"
          maxLength={6}
          data-testid="room-code-input"
        />
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <label className="text-sm font-medium text-text-primary">{t('party:password_optional')}</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('party:enter_password')}
          iconLeft={<Key className="w-4 h-4" />}
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Button
          className="w-full"
          onClick={handleJoin}
          disabled={!roomCode.trim() || joinParty.isPending}
          data-testid="join-party-submit"
        >
          {joinParty.isPending ? t('common:loading') : t('party:join')}
        </Button>
      </motion.div>
    </motion.div>
  )
}

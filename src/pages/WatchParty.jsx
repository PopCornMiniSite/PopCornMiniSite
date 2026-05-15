import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabase'
import VideoPlayer from '../components/VideoPlayer'
import ChatBubble from '../components/ChatBubble'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'

export default function WatchParty() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [roomMessages, setRoomMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const [createForm, setCreateForm] = useState({ name: '', mediaUrl: '', isPublic: true, password: '' })
  const [joinForm, setJoinForm] = useState({ code: '', password: '' })

  const mediaParam = searchParams.get('media')
  const channelRef = useRef(null)

  const fetchRooms = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('watch_party_rooms')
      .select('*')
      .eq('status', 'idle')
      .order('created_at', { ascending: false })
    if (data) setRooms(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  const createRoom = async () => {
    if (!createForm.name.trim() || !user) return
    const passwordHash = createForm.password
      ? await crypto.subtle.digest('SHA-256', new TextEncoder().encode(createForm.password))
          .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''))
      : null
    const { data, error } = await supabase
      .from('watch_party_rooms')
      .insert({
        title: createForm.name,
        created_by: user.id,
        media_url: createForm.mediaUrl || mediaParam || '',
        is_private: !createForm.isPublic,
        password_hash: passwordHash,
      })
      .select()
      .single()
    if (!error && data) {
      setCurrentRoom(data)
      setView('room')
      subscribeToRoom(data.id)
    }
  }

  const joinRoom = async () => {
    if (!joinForm.code.trim()) return
    const { data } = await supabase
      .from('watch_party_rooms')
      .select('*')
      .eq('id', joinForm.code)
      .single()
    if (data && data.is_active) {
      if (data.password_hash) {
        const inputHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(joinForm.password))
          .then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''))
        if (inputHash !== data.password_hash) {
          alert('Wrong password')
          return
        }
      }
      setCurrentRoom(data)
      setView('room')
      subscribeToRoom(data.id)
    }
  }

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [])

  const subscribeToRoom = (roomId) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    const channel = supabase.channel(`party:${roomId}`)
    channel
      .on('broadcast', { event: 'chat' }, (payload) => {
        setRoomMessages((prev) => [...prev.slice(-99), payload.payload])
      })
      .subscribe()
    channelRef.current = channel
  }

  const sendPartyChat = async () => {
    if (!chatInput.trim() || !user || !currentRoom) return
    const msg = {
      text: chatInput,
      userId: user.id,
      userName: user.username || user.firstName || 'User',
      timestamp: new Date().toISOString(),
    }
    await supabase.channel(`party:${currentRoom.id}`).send({
      type: 'broadcast',
      event: 'chat',
      payload: msg,
    })
    setRoomMessages((prev) => [...prev, msg])
    setChatInput('')
  }

  const leaveRoom = async () => {
    setCurrentRoom(null)
    setView('list')
    setRoomMessages([])
    fetchRooms()
  }

  if (view === 'room' && currentRoom) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-xl">
          <button onClick={leaveRoom} className="flex items-center gap-2 text-sm text-muted hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('party.leaveRoom')}
          </button>
          <h1 className="text-sm font-medium">{currentRoom.name}</h1>
          <span className="text-xs text-muted">{t('party.members')}: 1</span>
        </div>

        {currentRoom.media_url && (
          <div className="aspect-video bg-black">
            <VideoPlayer
              src={currentRoom.media_url}
            />
          </div>
        )}

        <div className="flex-1 flex flex-col bg-background">
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {roomMessages.length === 0 && (
              <p className="text-sm text-muted text-center mt-8">{t('chat.noMessages')}</p>
            )}
            {roomMessages.map((msg, i) => (
              <ChatBubble
                key={i}
                message={msg.text}
                isOwn={msg.userId === user?.id}
                senderName={msg.userName}
                timestamp={msg.timestamp}
              />
            ))}
          </div>
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendPartyChat()}
                placeholder={t('chat.typeMessage')}
                className="flex-1 tg-input"
              />
              <button onClick={sendPartyChat} className="tg-btn !p-3 !rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold mb-1">{t('party.title')}</h1>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-card rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">{t('party.createRoom')}</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder={t('party.roomName')}
              className="tg-input"
            />
            <input
              type="text"
              value={createForm.mediaUrl}
              onChange={(e) => setCreateForm({ ...createForm, mediaUrl: e.target.value })}
              placeholder="Movie/TV URL or ID"
              className="tg-input"
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder={t('party.password')}
              className="tg-input"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={createForm.isPublic}
                  onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                  className="accent-primary"
                />
                {t('party.public')}
              </label>
            </div>
            <button onClick={createRoom} className="tg-btn w-full">{t('party.createRoom')}</button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">{t('party.joinRoom')}</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={joinForm.code}
              onChange={(e) => setJoinForm({ ...joinForm, code: e.target.value })}
              placeholder={t('party.roomCode')}
              className="tg-input"
            />
            <input
              type="password"
              value={joinForm.password}
              onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
              placeholder={t('party.password')}
              className="tg-input"
            />
            <button onClick={joinRoom} className="tg-btn-outline w-full">{t('party.joinRoom')}</button>
          </div>
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-lg font-semibold mb-3">{t('party.title')}</h2>
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : rooms.length === 0 ? (
          <EmptyState message={t('party.noRooms')} />
        ) : (
          <div className="space-y-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => { setCurrentRoom(room); setView('room') }}
                className="bg-card rounded-xl p-3 cursor-pointer hover:bg-card-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{room.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${room.is_public ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {room.is_public ? t('party.public') : t('party.private')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>{t('party.host')}: {room.host_id?.slice(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

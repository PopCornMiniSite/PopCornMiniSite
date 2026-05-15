import React, { useEffect, useRef, useState } from 'react'
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
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(10,10,10,0.95)' }}>
          <button onClick={leaveRoom} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('party.leaveRoom')}
          </button>
          <h1 style={{ fontSize: '14px', fontWeight: 500 }}>{currentRoom.name}</h1>
          <span style={{ fontSize: '12px', color: '#6B7280' }}>{t('party.members')}: 1</span>
        </div>

        {currentRoom.media_url && (
          <div style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
            <VideoPlayer src={currentRoom.media_url} />
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0A0A0A' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {roomMessages.length === 0 && (
              <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginTop: '32px' }}>{t('chat.noMessages')}</p>
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
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendPartyChat()}
                placeholder={t('chat.typeMessage')}
                style={{
                  flex: 1, backgroundColor: '#141428', color: '#fff',
                  borderRadius: '12px', padding: '12px 16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '14px', outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = '#E50914'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button onClick={sendPartyChat} style={{
                backgroundColor: '#E50914', color: '#fff', border: 'none',
                borderRadius: '12px', padding: '12px', cursor: 'pointer',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '96px' }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{t('party.title')}</h1>
      </div>

      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('party.createRoom')}</h2>
          <div>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder={t('party.roomName')}
              style={{
                width: '100%', backgroundColor: '#141428', color: '#fff',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#E50914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              type="text"
              value={createForm.mediaUrl}
              onChange={(e) => setCreateForm({ ...createForm, mediaUrl: e.target.value })}
              placeholder="Movie/TV URL or ID"
              style={{
                width: '100%', backgroundColor: '#141428', color: '#fff',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#E50914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              type="password"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder={t('party.password')}
              style={{
                width: '100%', backgroundColor: '#141428', color: '#fff',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#E50914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={createForm.isPublic}
                  onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                />
                {t('party.public')}
              </label>
            </div>
            <button onClick={createRoom} style={{
              width: '100%', backgroundColor: '#E50914', color: '#fff', fontWeight: 600,
              padding: '12px', borderRadius: '12px', border: 'none', fontSize: '14px', cursor: 'pointer',
            }}>{t('party.createRoom')}</button>
          </div>
        </div>

        <div style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('party.joinRoom')}</h2>
          <div>
            <input
              type="text"
              value={joinForm.code}
              onChange={(e) => setJoinForm({ ...joinForm, code: e.target.value })}
              placeholder={t('party.roomCode')}
              style={{
                width: '100%', backgroundColor: '#141428', color: '#fff',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#E50914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <input
              type="password"
              value={joinForm.password}
              onChange={(e) => setJoinForm({ ...joinForm, password: e.target.value })}
              placeholder={t('party.password')}
              style={{
                width: '100%', backgroundColor: '#141428', color: '#fff',
                borderRadius: '12px', padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '14px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#E50914'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            <button onClick={joinRoom} style={{
              width: '100%', backgroundColor: 'transparent', color: '#E50914', fontWeight: 600,
              padding: '12px', borderRadius: '12px', border: '1px solid #E50914',
              fontSize: '14px', cursor: 'pointer',
            }}>{t('party.joinRoom')}</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{t('party.title')}</h2>
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : rooms.length === 0 ? (
          <EmptyState message={t('party.noRooms')} />
        ) : (
          <div>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => { setCurrentRoom(room); setView('room') }}
                style={{ backgroundColor: '#1A1A2E', borderRadius: '12px', padding: '12px', cursor: 'pointer', marginBottom: '8px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ fontWeight: 500 }}>{room.name}</h3>
                  <span style={{
                    fontSize: '12px', padding: '2px 8px', borderRadius: '999px',
                    backgroundColor: room.is_public ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                    color: room.is_public ? '#22c55e' : '#eab308',
                  }}>
                    {room.is_public ? t('party.public') : t('party.private')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
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

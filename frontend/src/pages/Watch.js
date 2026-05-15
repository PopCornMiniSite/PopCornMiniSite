import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMovieDetails, getTvDetails } from '../lib/tmdb'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabase'
import VideoPlayer from '../components/VideoPlayer'
import QualitySelector from '../components/QualitySelector'
import ChatBubble from '../components/ChatBubble'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Watch() {
  const { mediaType, id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, addToHistory } = useAuthStore()

  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [streams, setStreams] = useState({})
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const season = searchParams.get('season')
  const episode = searchParams.get('episode')

  useEffect(() => {
    setLoading(true)
    const fetchFn = mediaType === 'tv' ? getTvDetails : getMovieDetails
    fetchFn(id).then((data) => {
      setMedia(data)
      if (mediaType === 'movie') {
        addToHistory({ ...data, media_type: 'movie' })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id, mediaType, addToHistory])

  useEffect(() => {
    async function fetchStreams() {
      try {
        const { data, error } = await supabase
          .from('streams')
          .select('*')
          .eq('media_id', id.toString())
          .eq('media_type', mediaType)

        if (!error && data) {
          const streamMap = {}
          data.forEach((s) => {
            if (s.season && s.episode) {
              const key = `S${s.season}E${s.episode}`
              if (!streamMap[key]) streamMap[key] = {}
              streamMap[key][s.quality] = s.url
            } else {
              streamMap[s.quality] = s.url
            }
          })
          setStreams(streamMap)
        }
      } catch (e) {
        console.error('Failed to fetch streams:', e)
      }
    }
    fetchStreams()
  }, [id, mediaType])

  const getStreamUrl = useCallback(() => {
    const key = season ? `S${season}E${episode}` : null
    if (key && streams[key]) {
      return streams[key][selectedQuality] || Object.values(streams[key])[0]
    }
    return streams[selectedQuality] || Object.values(streams)[0]
  }, [streams, selectedQuality, season, episode])

  const streamUrl = getStreamUrl()

  useEffect(() => {
    if (!streamUrl) return
    const channel = supabase
      .channel(`watch:${id}`)
      .on('broadcast', { event: 'chat' }, (payload) => {
        setChatMessages((prev) => [...prev.slice(-99), payload.payload])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id, streamUrl])

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !user) return
    const msg = {
      text: chatInput,
      userId: user.id,
      userName: user.username || user.firstName || 'User',
      timestamp: new Date().toISOString(),
    }
    await supabase.channel(`watch:${id}`).send({
      type: 'broadcast',
      event: 'chat',
      payload: msg,
    })
    setChatMessages((prev) => [...prev, msg])
    setChatInput('')
  }

  const handleEnded = () => {
    if (mediaType === 'tv' && season && episode) {
      const nextEp = parseInt(episode) + 1
      navigate(`/watch/tv/${id}?season=${season}&episode=${nextEp}`)
    }
  }

  if (loading) return <LoadingSpinner size="lg" text={t('watch.buffering')} />

  const title = media?.title || media?.name || ''

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        }}>
          <button onClick={() => navigate(-1)} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QualitySelector selected={selectedQuality} onSelect={setSelectedQuality} sources={streams} />
            <button
              onClick={() => setShowChat(!showChat)}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: showChat ? '#E50914' : 'rgba(0,0,0,0.5)',
                border: 'none', cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ flex: showChat ? '0 0 66.666%' : '1', maxWidth: showChat ? '66.666%' : '100%' }}>
            {streamUrl ? (
              <VideoPlayer
                src={streamUrl}
                poster={media?.backdrop_path ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}` : undefined}
                onEnded={handleEnded}
              />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                <p style={{ color: '#6B7280' }}>{t('movie.noStreams')}</p>
              </div>
            )}
          </div>

          {showChat && (
            <div style={{
              flex: '0 0 33.333%', backgroundColor: 'rgba(10,10,10,0.95)',
              display: 'flex', flexDirection: 'column', borderLeft: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {chatMessages.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginTop: '32px' }}>{t('chat.noMessages')}</p>
                )}
                {chatMessages.map((msg, i) => (
                  <ChatBubble
                    key={i}
                    message={msg.text}
                    isOwn={msg.userId === user?.id}
                    senderName={msg.userName}
                    timestamp={msg.timestamp}
                  />
                ))}
              </div>
              <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder={t('chat.typeMessage')}
                    style={{
                      flex: 1, backgroundColor: '#141428', color: '#fff',
                      borderRadius: '8px', padding: '8px 12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: '14px', outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#E50914'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button onClick={sendChatMessage} style={{
                    backgroundColor: '#E50914', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '8px', cursor: 'pointer',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {mediaType === 'tv' && season && episode && (
          <div style={{ backgroundColor: 'rgba(10,10,10,0.95)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px' }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{title} - S{season}:E{episode}</p>
          </div>
        )}
      </div>
    </div>
  )
}

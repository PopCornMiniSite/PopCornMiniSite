import { useEffect, useState, useCallback } from 'react'
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
    <div className="min-h-screen bg-black flex flex-col">
      <div className="relative flex-1 flex flex-col">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <QualitySelector
              selected={selectedQuality}
              onSelect={setSelectedQuality}
              sources={streams}
            />
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-primary' : 'bg-black/50 backdrop-blur-sm'}`}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className={`flex-1 ${showChat ? 'w-2/3' : 'w-full'}`}>
            {streamUrl ? (
              <VideoPlayer
                src={streamUrl}
                poster={media?.backdrop_path ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}` : undefined}
                onEnded={handleEnded}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-black">
                <p className="text-muted">{t('movie.noStreams')}</p>
              </div>
            )}
          </div>

          {showChat && (
            <div className="w-1/3 bg-background/95 backdrop-blur-xl flex flex-col border-l border-white/10">
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {chatMessages.length === 0 && (
                  <p className="text-xs text-muted text-center mt-8">{t('chat.noMessages')}</p>
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
              <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder={t('chat.typeMessage')}
                    className="flex-1 bg-surface text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-primary focus:outline-none"
                  />
                  <button onClick={sendChatMessage} className="tg-btn !p-2 !rounded-lg">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {mediaType === 'tv' && season && episode && (
          <div className="bg-background/95 backdrop-blur-xl border-t border-white/10 px-4 py-2">
            <p className="text-sm text-white/80">{title} - S{season}:E{episode}</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useCreateParty } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Search, Lock, Globe, Film, Tv } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/ui/motion'
import { useDebounce } from '@/hooks/useLocalStorage'
import { useSearchQuery } from '@/lib/api'

export default function PartyCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createParty = useCreateParty()

  const preMediaType = searchParams.get('media_type') as 'movie' | 'series' | null
  const preMediaId = searchParams.get('media_id')
  const preTitle = searchParams.get('title')

  const [title, setTitle] = useState(preTitle ?? '')
  const [mediaType, setMediaType] = useState<'movie' | 'series'>(preMediaType ?? 'movie')
  const [mediaId, setMediaId] = useState(preMediaId ?? '')
  const [isPrivate, setIsPrivate] = useState(false)
  const [password, setPassword] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)
  const { data: searchResults } = useSearchQuery(showSearch ? debouncedSearch : '', mediaType === 'series' ? 'series' : 'movie')

  useEffect(() => {
    if (preTitle) setTitle(preTitle)
    if (preMediaId) setMediaId(preMediaId)
    if (preMediaType) setMediaType(preMediaType)
  }, [preTitle, preMediaId, preMediaType])

  const handleCreate = async () => {
    if (!title.trim() || !mediaId) return

    const result = await createParty.mutateAsync({
      title: title.trim(),
      media_type: mediaType,
      media_id: Number(mediaId),
      visibility: isPrivate ? 'private' : 'public',
      password: isPrivate ? password : undefined,
    })

    navigate(`/party/${result.data.room_code}`)
  }

  const selectSearchResult = (item: any) => {
    setTitle(item.name)
    setMediaId(String(item.tmdb_id))
    setMediaType(item.media_type === 'series' ? 'series' : 'movie')
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <motion.div
      className="p-4 space-y-4"
      data-testid="party-create-page"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold font-display text-text-primary">{t('party:create_party')}</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="flex items-center gap-1 text-sm text-brand-primary hover:text-brand-primary-hover transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          {showSearch ? t('common:close') : t('party:search_content')}
        </button>
      </div>

      {showSearch && (
        <motion.div className="space-y-2" variants={staggerItem} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('discover:search_placeholder')}
            iconLeft={<Search className="w-4 h-4" />}
            autoFocus
          />
          {debouncedSearch && searchResults && searchResults.items.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl bg-bg-tertiary border border-border-subtle divide-y divide-border-subtle">
              {searchResults.items.slice(0, 8).map((item: any) => (
                <button
                  key={`${item.media_type}-${item.tmdb_id}`}
                  onClick={() => selectSearchResult(item)}
                  className="w-full flex items-center gap-3 p-2.5 hover:bg-bg-hover transition-colors text-right cursor-pointer"
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-bg-hover flex-shrink-0 border border-border-subtle">
                    {item.poster_url ? (
                      <img src={item.poster_url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.media_type === 'movie' ? <Film className="w-4 h-4 text-brand-primary" /> : <Tv className="w-4 h-4 text-brand-primary" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
                    <p className="text-[11px] text-text-tertiary">
                      {item.media_type === 'movie' ? t('party:movie') : t('party:series')}
                      {item.date && <span> · {item.date.split('-')[0]}</span>}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <motion.div className="space-y-2" variants={staggerItem}>
        <label className="text-sm font-medium text-text-primary">{t('party:party_title')}</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('party:enter_title')}
          data-testid="party-title-input"
        />
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <label className="text-sm font-medium text-text-primary">{t('party:media_type')}</label>
        <div className="flex gap-2">
          <Button
            variant={mediaType === 'movie' ? 'primary' : 'outline'}
            onClick={() => setMediaType('movie')}
          >
            <Film className="w-4 h-4 ml-1" /> {t('party:movie')}
          </Button>
          <Button
            variant={mediaType === 'series' ? 'primary' : 'outline'}
            onClick={() => setMediaType('series')}
          >
            <Tv className="w-4 h-4 ml-1" /> {t('party:series')}
          </Button>
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={staggerItem}>
        <label className="text-sm font-medium text-text-primary">
          {mediaType === 'movie' ? t('party:movie_id') : t('party:series_id')}
        </label>
        <Input
          type="number"
          value={mediaId}
          onChange={(e) => setMediaId(e.target.value)}
          placeholder={t('party:enter_media_id', { defaultValue: 'اختر من البحث أعلاه أو أدخل الرقم' })}
          data-testid="media-id-input"
        />
      </motion.div>

      <motion.div variants={staggerItem}><Separator /></motion.div>

      <motion.div className="flex items-center justify-between" variants={staggerItem}>
        <div className="flex items-center gap-2">
          {isPrivate ? <Lock className="w-4 h-4 text-brand-primary" /> : <Globe className="w-4 h-4 text-text-tertiary" />}
          <label className="text-sm font-medium text-text-primary">{t('party:private')}</label>
        </div>
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="rounded border-border-default accent-brand-primary"
        />
      </motion.div>

      {isPrivate && (
        <motion.div className="space-y-2" variants={staggerItem}>
          <label className="text-sm font-medium text-text-primary">{t('party:password')}</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('party:enter_password')}
          />
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={!title.trim() || !mediaId || createParty.isPending}
          data-testid="create-party-submit"
        >
          {createParty.isPending ? t('common:loading') : t('party:create')}
        </Button>
      </motion.div>
    </motion.div>
  )
}
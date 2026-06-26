import { http, HttpResponse, delay } from 'msw'

interface MockUser {
  id: number
  username: string
  first_name: string
  last_name: string
  language_code: string
  is_premium: boolean
  photo_url: string
  stars_balance: number
  kernels_balance: number
  total_earned_kernels: number
  total_spent_kernels: number
}

interface MockMovie {
  tmdb_id: number
  title: string
  overview: string
  poster_url: string
  backdrop_url: string
  vote_average: number
  genres: string[]
  runtime: number
  release_date: string
}

interface MockCastMember {
  id: number
  name: string
  character: string
  profile_url: string
  order: number
}

interface MockCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_url: string
}

interface MockSeries {
  tmdb_id: number
  name: string
  overview: string
  poster_url: string
  backdrop_url: string
  vote_average: number
  genres: string[]
  number_of_seasons: number
  number_of_episodes: number
  first_air_date: string
  status: string
  seasons: Array<{
    season_number: number
    name: string
    overview: string
    poster_url: string
    episode_count: number
    air_date: string
  }>
}

interface MockSeasonDetail {
  season_number: number
  name: string
  overview: string
  poster_url: string
  air_date: string
  episodes: Array<{
    id: number
    episode_number: number
    season_number: number
    name: string
    overview: string
    still_url: string
    runtime: number
    air_date: string
    series_id: number
  }>
}

interface MockProduct {
  id: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  category: string
  rarity: string
  price_stars: number
  price_kernels: number | null
  payment_method: 'stars' | 'kernels' | 'both'
  image_url: string
  preview_images: string[]
  is_purchasable: boolean
  is_limited: boolean
  max_quantity?: number
  sold_count: number
  tags: string[]
  created_at: string
  updated_at: string
  assets: Array<{
    id: string
    type: string
    name: string
    file_url: string
    preview_url: string
    metadata: Record<string, unknown>
  }>
}

interface MockComment {
  id: number
  user_id: number
  tmdb_id: number
  media_type: string
  parent_id: number | null
  content: string
  is_spoiler: boolean
  likes_count: number
  dislikes_count: number
  replies_count: number
  status: string
  created_at: string
  updated_at: string
  username: string
  first_name: string
  photo_url: string
  user_like_type?: string | null
  replies?: MockComment[]
}

interface MockPartyRoom {
  id: string
  room_code: string
  host_user_id: number
  title: string
  media_type: string
  media_id: number
  series_id?: number
  season_number?: number
  episode_number?: number
  visibility: string
  status: string
  max_participants: number
  participant_count: number
  participants: Array<{
    id: string
    user_id: number
    name: string
    avatar_url: string
    role: string
    is_ready: boolean
    is_online: boolean
    joined_at: string
  }>
  created_at: string
}

interface MockNotification {
  id: string
  user_id: number
  type: string
  title: string
  body: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

interface MockConversation {
  id: string
  last_message: string
  last_message_at: string
  unread_count: number
  other_user: {
    id: number
    name: string
    avatar_url: string
    is_online: boolean
  }
}

interface MockMessage {
  id: string
  sender_id: number
  content: string
  created_at: string
}

const MOCK_USER: MockUser = {
  id: 5703679073,
  username: 'MLk_JAMAL',
  first_name: 'مطور',
  last_name: 'PopCorn',
  language_code: 'ar',
  is_premium: true,
  photo_url: '',
  stars_balance: 150,
  kernels_balance: 2450,
  total_earned_kernels: 4800,
  total_spent_kernels: 2350,
}

const MOCK_MOVIES: MockMovie[] = [
  {
    tmdb_id: 550988,
    title: 'Free Guy',
    overview: 'A bank teller who discovers he is actually a background character in an open-world video game.',
    poster_url: 'https://image.tmdb.org/t/p/w342/8Y43SOcDlFwQ6C0U11NZCt01Cdf.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/8Y43SOcDlFwQ6C0U11NZCt01Cdf.jpg',
    vote_average: 7.7,
    genres: ['Action', 'Comedy'],
    runtime: 115,
    release_date: '2021-08-11',
  },
  {
    tmdb_id: 299536,
    title: 'Avengers: Infinity War',
    overview: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos.',
    poster_url: 'https://image.tmdb.org/t/p/w342/7WsyChQLEftFiDhRDUMs5jJGMHa.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/7WsyChQLEftFiDhRDUMs5jJGMHa.jpg',
    vote_average: 8.3,
    genres: ['Action', 'Adventure'],
    runtime: 149,
    release_date: '2018-04-25',
  },
  {
    tmdb_id: 670292,
    title: 'The Creator',
    overview: 'Against the backdrop of a war between humans and AI, an ex-agent discovers a child who holds the key to ending the war.',
    poster_url: 'https://image.tmdb.org/t/p/w342/hnmN04o5c98WkFB4eCgX2k2R9sJ.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/hnmN04o5c98WkFB4eCgX2k2R9sJ.jpg',
    vote_average: 7.1,
    genres: ['Science Fiction', 'Action'],
    runtime: 133,
    release_date: '2023-09-27',
  },
  {
    tmdb_id: 1011985,
    title: 'Kung Fu Panda 4',
    overview: 'Po must train a new warrior when he is chosen to become the Spiritual Leader of the Valley of Peace.',
    poster_url: 'https://image.tmdb.org/t/p/w342/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    vote_average: 7.0,
    genres: ['Animation', 'Family'],
    runtime: 94,
    release_date: '2024-03-02',
  },
  {
    tmdb_id: 823464,
    title: 'Godzilla x Kong: The New Empire',
    overview: 'Two ancient titans, Godzilla and Kong, team up to face a colossal undiscovered threat.',
    poster_url: 'https://image.tmdb.org/t/p/w342/z1p34vh7dEOnLDV4jC2GS1PUMHe.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/z1p34vh7dEOnLDV4jC2GS1PUMHe.jpg',
    vote_average: 7.1,
    genres: ['Action', 'Science Fiction'],
    runtime: 115,
    release_date: '2024-03-29',
  },
  {
    tmdb_id: 508883,
    title: 'The Boy and the Heron',
    overview: 'A young boy discovers a magical heron that takes him to a fantastical world.',
    poster_url: 'https://image.tmdb.org/t/p/w342/f4oZTcfGrVTXKTWg157aqQ4xnjw.jpg',
    backdrop_url: 'https://image.tmdb.org/t/p/w780/f4oZTcfGrVTXKTWg157aqQ4xnjw.jpg',
    vote_average: 7.5,
    genres: ['Animation', 'Fantasy'],
    runtime: 124,
    release_date: '2023-07-14',
  },
]

const MOCK_CAST: MockCastMember[] = [
  { id: 1, name: 'Ryan Reynolds', character: 'Guy', profile_url: '', order: 0 },
  { id: 2, name: 'Jodie Comer', character: 'Millie / Molotov Girl', profile_url: '', order: 1 },
  { id: 3, name: 'Taika Waititi', character: 'Antwan', profile_url: '', order: 2 },
  { id: 4, name: 'Lil Rel Howery', character: 'Buddy', profile_url: '', order: 3 },
]

const MOCK_CREW: MockCrewMember[] = [
  { id: 10, name: 'Shawn Levy', job: 'Director', department: 'Directing', profile_url: '' },
  { id: 11, name: 'Matt Lieberman', job: 'Screenplay', department: 'Writing', profile_url: '' },
]

const MOCK_SERIES: MockSeries = {
  tmdb_id: 1396,
  name: 'Breaking Bad',
  overview: 'A chemistry teacher diagnosed with terminal cancer turns to manufacturing methamphetamine.',
  poster_url: 'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  backdrop_url: 'https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
  vote_average: 9.5,
  genres: ['Drama', 'Crime'],
  number_of_seasons: 5,
  number_of_episodes: 62,
  first_air_date: '2008-01-20',
  status: 'Ended',
  seasons: [
    { season_number: 1, name: 'Season 1', overview: 'Walter White begins his journey.', poster_url: '', episode_count: 7, air_date: '2008-01-20' },
    { season_number: 2, name: 'Season 2', overview: 'The operation expands.', poster_url: '', episode_count: 13, air_date: '2009-03-08' },
    { season_number: 3, name: 'Season 3', overview: 'New threats emerge.', poster_url: '', episode_count: 13, air_date: '2010-03-21' },
    { season_number: 4, name: 'Season 4', overview: 'Gus Fring becomes the main antagonist.', poster_url: '', episode_count: 13, air_date: '2011-07-17' },
    { season_number: 5, name: 'Season 5', overview: 'The final chapter.', poster_url: '', episode_count: 16, air_date: '2012-07-15' },
  ],
}

const MOCK_SEASON: MockSeasonDetail = {
  season_number: 1,
  name: 'Season 1',
  overview: 'Walter White, a high school chemistry teacher, learns he has lung cancer and decides to partner with former student Jesse Pinkman.',
  poster_url: '',
  air_date: '2008-01-20',
  episodes: [
    { id: 101, episode_number: 1, season_number: 1, name: 'Pilot', overview: 'Walter White is diagnosed with lung cancer and partners with Jesse.', still_url: '', runtime: 58, air_date: '2008-01-20', series_id: 1396 },
    { id: 102, episode_number: 2, season_number: 1, name: "Cat's in the Bag...", overview: 'Walter and Jesse attempt to deal with the consequences.', still_url: '', runtime: 48, air_date: '2008-01-27', series_id: 1396 },
    { id: 103, episode_number: 3, season_number: 1, name: "...And the Bag's in the River", overview: 'Walter and Jesse face their first moral dilemma.', still_url: '', runtime: 48, air_date: '2008-02-10', series_id: 1396 },
  ],
}

// ─── Store Products (46) ───────────────────────────────────────────────────────

const MOCK_PRODUCTS: MockProduct[] = [
  // ─── Asset Packs ──────────────────────────────────────────────────────
  { id: 'pack-common', name: 'Common Pack', name_ar: 'حزمة عادية', description: 'A pack of 3 common items', description_ar: 'حزمة من 3 عناصر عادية', category: 'asset_pack', rarity: 'common', price_stars: 50, price_kernels: 800, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1234, tags: ['pack', 'common'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'a1', type: 'badge', name: 'Common Badge', file_url: '', preview_url: '', metadata: {} }, { id: 'a2', type: 'icon', name: 'Common Icon', file_url: '', preview_url: '', metadata: {} }, { id: 'a3', type: 'emoji', name: 'Common Emoji', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'pack-uncommon', name: 'Uncommon Pack', name_ar: 'حزمة غير عادية', description: 'A pack of 5 uncommon items', description_ar: 'حزمة من 5 عناصر غير عادية', category: 'asset_pack', rarity: 'uncommon', price_stars: 100, price_kernels: 1500, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 890, tags: ['pack', 'uncommon'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [] },
  { id: 'pack-rare', name: 'Rare Pack', name_ar: 'حزمة نادرة', description: 'A pack of 6 rare items', description_ar: 'حزمة من 6 عناصر نادرة', category: 'asset_pack', rarity: 'rare', price_stars: 250, price_kernels: 5000, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 456, tags: ['pack', 'rare'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [] },
  { id: 'pack-epic', name: 'Epic Pack', name_ar: 'حزمة ملحمية', description: 'A pack of 6 epic items', description_ar: 'حزمة من 6 عناصر ملحمية', category: 'asset_pack', rarity: 'epic', price_stars: 500, price_kernels: 10000, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 100, sold_count: 78, tags: ['pack', 'epic', 'limited'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [] },
  { id: 'pack-legendary', name: 'Legendary Pack', name_ar: 'حزمة أسطورية', description: 'A pack of 8 legendary items', description_ar: 'حزمة من 8 عناصر أسطورية', category: 'asset_pack', rarity: 'legendary', price_stars: 1000, price_kernels: null, payment_method: 'stars', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 50, sold_count: 12, tags: ['pack', 'legendary', 'limited'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [] },

  // ─── Themes ───────────────────────────────────────────────────────────
  { id: 'theme-ocean', name: 'Ocean Depths', name_ar: ' أعماق المحيط', description: 'Deep ocean blue theme', description_ar: 'سماء المحيط العميقة', category: 'theme', rarity: 'rare', price_stars: 30, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 567, tags: ['theme', 'ocean', 'blue'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 't1', type: 'theme', name: 'Ocean Theme', file_url: '', preview_url: '', metadata: { primary: '#0A1628', accent: '#00BCD4', secondary: '#1A2A4A' } }] },
  { id: 'theme-sunset', name: 'Sunset Glow', name_ar: 'وهج الغروب', description: 'Warm sunset colors', description_ar: 'ألوان الغروب الدافئة', category: 'theme', rarity: 'rare', price_stars: 30, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 432, tags: ['theme', 'sunset', 'warm'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 't2', type: 'theme', name: 'Sunset Theme', file_url: '', preview_url: '', metadata: { primary: '#1A0A2E', accent: '#FF6F00', secondary: '#4A1A2E' } }] },
  { id: 'theme-forest', name: 'Forest Canopy', name_ar: 'مظلة الغابة', description: 'Lush green forest theme', description_ar: 'سماء الغابة الخضراء', category: 'theme', rarity: 'rare', price_stars: 30, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 345, tags: ['theme', 'forest', 'green'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 't3', type: 'theme', name: 'Forest Theme', file_url: '', preview_url: '', metadata: { primary: '#0A1A0A', accent: '#8BC34A', secondary: '#1A2A1A' } }] },
  { id: 'theme-midnight', name: 'Midnight Neon', name_ar: 'نيون منتصف الليل', description: 'Dark neon cyberpunk theme', description_ar: 'سماء النيون المظلمة', category: 'theme', rarity: 'epic', price_stars: 30, price_kernels: 800, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 234, tags: ['theme', 'neon', 'cyberpunk'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 't4', type: 'theme', name: 'Midnight Theme', file_url: '', preview_url: '', metadata: { primary: '#0A0A1A', accent: '#FF4081', secondary: '#1A0A1A' } }] },
  { id: 'theme-royal', name: 'Royal Crimson', name_ar: 'قرمزي ملكي', description: 'Elegant royal crimson theme', description_ar: 'سماء القرمزي الملكي', category: 'theme', rarity: 'legendary', price_stars: 50, price_kernels: null, payment_method: 'stars', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 200, sold_count: 89, tags: ['theme', 'royal', 'gold'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 't5', type: 'theme', name: 'Royal Theme', file_url: '', preview_url: '', metadata: { primary: '#1A0A0A', accent: '#FFD700', secondary: '#2A1A1A' } }] },

  // ─── Badges ───────────────────────────────────────────────────────────
  { id: 'badge-early-bird', name: 'Early Bird', name_ar: 'مبكر', description: 'Early adopter badge', description_ar: 'شارة المبكر', category: 'badge', rarity: 'common', price_stars: 20, price_kernels: 300, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 2345, tags: ['badge', 'achievement'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b1', type: 'badge', name: 'Early Bird Badge', file_url: '', preview_url: '', metadata: { tier: 'achievement' } }] },
  { id: 'badge-streak-7', name: '7-Day Streak', name_ar: 'تسلسل 7 أيام', description: 'Watched 7 days in a row', description_ar: 'شاهد 7 أيام متتالية', category: 'badge', rarity: 'common', price_stars: 20, price_kernels: 300, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1890, tags: ['badge', 'streak'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b2', type: 'badge', name: 'Streak 7 Badge', file_url: '', preview_url: '', metadata: { tier: 'achievement' } }] },
  { id: 'badge-streak-30', name: '30-Day Streak', name_ar: 'تسلسل 30 يوم', description: 'Watched 30 days in a row', description_ar: 'شاهد 30 يوم متتالي', category: 'badge', rarity: 'rare', price_stars: 20, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 456, tags: ['badge', 'streak'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b3', type: 'badge', name: 'Streak 30 Badge', file_url: '', preview_url: '', metadata: { tier: 'achievement' } }] },
  { id: 'badge-supporter', name: 'Supporter', name_ar: 'داعم', description: 'Supporter of the platform', description_ar: 'داعم المنصة', category: 'badge', rarity: 'rare', price_stars: 20, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 789, tags: ['badge', 'special'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b4', type: 'badge', name: 'Supporter Badge', file_url: '', preview_url: '', metadata: { tier: 'special' } }] },
  { id: 'badge-vip', name: 'VIP Member', name_ar: 'عضو VIP', description: 'VIP membership badge', description_ar: 'شارة عضوية VIP', category: 'badge', rarity: 'epic', price_stars: 30, price_kernels: 800, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 500, sold_count: 234, tags: ['badge', 'vip', 'special'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b5', type: 'badge', name: 'VIP Badge', file_url: '', preview_url: '', metadata: { tier: 'special' } }] },
  { id: 'badge-legend', name: 'Legend', name_ar: 'أسطورة', description: 'Legendary status badge', description_ar: 'شارة الأسطورة', category: 'badge', rarity: 'legendary', price_stars: 50, price_kernels: null, payment_method: 'stars', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 100, sold_count: 23, tags: ['badge', 'legend', 'special'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b6', type: 'badge', name: 'Legend Badge', file_url: '', preview_url: '', metadata: { tier: 'special' } }] },
  { id: 'badge-summer-2024', name: 'Summer 2024', name_ar: 'صيف 2024', description: 'Summer 2024 seasonal badge', description_ar: 'شارة صيف 2024', category: 'badge', rarity: 'common', price_stars: 20, price_kernels: 250, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 1000, sold_count: 567, tags: ['badge', 'seasonal', 'summer'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b7', type: 'badge', name: 'Summer Badge', file_url: '', preview_url: '', metadata: { tier: 'seasonal' } }] },
  { id: 'badge-winter-2024', name: 'Winter 2024', name_ar: 'شتاء 2024', description: 'Winter 2024 seasonal badge', description_ar: 'شارة شتاء 2024', category: 'badge', rarity: 'common', price_stars: 20, price_kernels: 250, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 1000, sold_count: 432, tags: ['badge', 'seasonal', 'winter'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b8', type: 'badge', name: 'Winter Badge', file_url: '', preview_url: '', metadata: { tier: 'seasonal' } }] },
  { id: 'badge-contributor-1', name: 'Contributor Lv1', name_ar: 'مساهم مستوى 1', description: 'Level 1 contributor badge', description_ar: 'شارة المساهم مستوى 1', category: 'badge', rarity: 'common', price_stars: 20, price_kernels: 200, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 678, tags: ['badge', 'contributor'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b9', type: 'badge', name: 'Contributor 1 Badge', file_url: '', preview_url: '', metadata: { tier: 'contributor' } }] },
  { id: 'badge-contributor-2', name: 'Contributor Lv2', name_ar: 'مساهم مستوى 2', description: 'Level 2 contributor badge', description_ar: 'شارة المساهم مستوى 2', category: 'badge', rarity: 'rare', price_stars: 20, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 234, tags: ['badge', 'contributor'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'b10', type: 'badge', name: 'Contributor 2 Badge', file_url: '', preview_url: '', metadata: { tier: 'contributor' } }] },

  // ─── Wallpapers ───────────────────────────────────────────────────────
  { id: 'wp-nebula', name: 'Nebula', name_ar: 'سديم', description: 'Cosmic nebula wallpaper', description_ar: 'خلفية السديم الكوني', category: 'wallpaper', rarity: 'common', price_stars: 15, price_kernels: 200, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 890, tags: ['wallpaper', 'space'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'w1', type: 'wallpaper', name: 'Nebula WP', file_url: '', preview_url: '', metadata: { resolution: '1080x2340' } }] },
  { id: 'wp-cyberpunk', name: 'Cyberpunk City', name_ar: 'مدينة سايبربانك', description: 'Neon-lit cyberpunk city', description_ar: 'مدينة سايبربانك المضاءة', category: 'wallpaper', rarity: 'rare', price_stars: 15, price_kernels: 400, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 678, tags: ['wallpaper', 'cyberpunk'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'w2', type: 'wallpaper', name: 'Cyberpunk WP', file_url: '', preview_url: '', metadata: { resolution: '1080x2340' } }] },
  { id: 'wp-zen', name: 'Zen Garden', name_ar: 'حديقة زن', description: 'Peaceful zen garden', description_ar: 'حديقة زن السلمية', category: 'wallpaper', rarity: 'common', price_stars: 15, price_kernels: 200, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 567, tags: ['wallpaper', 'zen'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'w3', type: 'wallpaper', name: 'Zen WP', file_url: '', preview_url: '', metadata: { resolution: '1080x2340' } }] },
  { id: 'wp-aurora', name: 'Aurora Borealis', name_ar: 'الشفق القطبي', description: 'Northern lights', description_ar: 'الشفق القطبي', category: 'wallpaper', rarity: 'rare', price_stars: 15, price_kernels: 400, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 456, tags: ['wallpaper', 'aurora'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'w4', type: 'wallpaper', name: 'Aurora WP', file_url: '', preview_url: '', metadata: { resolution: '1080x2340' } }] },
  { id: 'wp-retrowave', name: 'Retrowave', name_ar: 'موجة رجعية', description: 'Retro synthwave style', description_ar: 'نمط الموجة الرجعية', category: 'wallpaper', rarity: 'common', price_stars: 15, price_kernels: 200, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 345, tags: ['wallpaper', 'retrowave'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'w5', type: 'wallpaper', name: 'Retrowave WP', file_url: '', preview_url: '', metadata: { resolution: '1080x2340' } }] },

  // ─── Frames ───────────────────────────────────────────────────────────
  { id: 'frame-slim', name: 'Slim Frame', name_ar: 'إطار رفيع', description: 'Simple slim frame', description_ar: 'إطار رفيع بسيط', category: 'frame', rarity: 'common', price_stars: 10, price_kernels: 150, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1234, tags: ['frame', 'slim'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f1', type: 'frame', name: 'Slim Frame', file_url: '', preview_url: '', metadata: { animated: false } }] },
  { id: 'frame-double', name: 'Double Line', name_ar: 'خط مزدوج', description: 'Double line frame', description_ar: 'إطار خط مزدوج', category: 'frame', rarity: 'common', price_stars: 10, price_kernels: 150, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1100, tags: ['frame', 'double'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f2', type: 'frame', name: 'Double Frame', file_url: '', preview_url: '', metadata: { animated: false } }] },
  { id: 'frame-dashed', name: 'Dashed', name_ar: 'متقطع', description: 'Dashed border frame', description_ar: 'إطار حد متقطع', category: 'frame', rarity: 'common', price_stars: 10, price_kernels: 150, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 980, tags: ['frame', 'dashed'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f3', type: 'frame', name: 'Dashed Frame', file_url: '', preview_url: '', metadata: { animated: false } }] },
  { id: 'frame-gradient', name: 'Gradient', name_ar: 'متدرج', description: 'Gradient color frame', description_ar: 'إطار لون متدرج', category: 'frame', rarity: 'common', price_stars: 10, price_kernels: 150, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 870, tags: ['frame', 'gradient'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f4', type: 'frame', name: 'Gradient Frame', file_url: '', preview_url: '', metadata: { animated: false } }] },
  { id: 'frame-pulse', name: 'Pulse', name_ar: 'نبض', description: 'Pulsing animated frame', description_ar: 'إطار نابض متحرك', category: 'frame', rarity: 'rare', price_stars: 25, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 567, tags: ['frame', 'pulse', 'animated'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f5', type: 'frame', name: 'Pulse Frame', file_url: '', preview_url: '', metadata: { animated: true } }] },
  { id: 'frame-rotate', name: 'Rotating', name_ar: 'دوار', description: 'Rotating animated frame', description_ar: 'إطار دوار متحرك', category: 'frame', rarity: 'rare', price_stars: 25, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 456, tags: ['frame', 'rotate', 'animated'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f6', type: 'frame', name: 'Rotate Frame', file_url: '', preview_url: '', metadata: { animated: true } }] },
  { id: 'frame-glitch', name: 'Glitch', name_ar: 'خلل', description: 'Glitch effect frame', description_ar: 'إطار تأثير الخلل', category: 'frame', rarity: 'epic', price_stars: 25, price_kernels: 800, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 345, tags: ['frame', 'glitch', 'animated'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f7', type: 'frame', name: 'Glitch Frame', file_url: '', preview_url: '', metadata: { animated: true } }] },
  { id: 'frame-fire', name: 'Fire', name_ar: 'نار', description: 'Fire effect frame', description_ar: 'إطار تأثير النار', category: 'frame', rarity: 'epic', price_stars: 25, price_kernels: 800, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: true, max_quantity: 300, sold_count: 123, tags: ['frame', 'fire', 'animated'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'f8', type: 'frame', name: 'Fire Frame', file_url: '', preview_url: '', metadata: { animated: true } }] },

  // ─── Emoji Packs ──────────────────────────────────────────────────────
  { id: 'emoji-anime', name: 'Anime Pack', name_ar: 'حزمة أنمي', description: '30 anime-style emojis', description_ar: '30 إيموجي بنمط الأنمي', category: 'emoji_pack', rarity: 'common', price_stars: 40, price_kernels: 600, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1234, tags: ['emoji', 'anime'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'e1', type: 'emoji', name: 'Anime Emoji', file_url: '', preview_url: '', metadata: { count: 30 } }] },
  { id: 'emoji-meme', name: 'Meme Pack', name_ar: 'حزمة ميم', description: '25 meme emojis', description_ar: '25 إيموجي ميم', category: 'emoji_pack', rarity: 'rare', price_stars: 60, price_kernels: 1000, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 890, tags: ['emoji', 'meme'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'e2', type: 'emoji', name: 'Meme Emoji', file_url: '', preview_url: '', metadata: { count: 25 } }] },
  { id: 'emoji-premium', name: 'Premium Pack', name_ar: 'حزمة مميزة', description: '50 premium emojis', description_ar: '50 إيموجي مميز', category: 'emoji_pack', rarity: 'epic', price_stars: 80, price_kernels: 1500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 567, tags: ['emoji', 'premium'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'e3', type: 'emoji', name: 'Premium Emoji', file_url: '', preview_url: '', metadata: { count: 50 } }] },

  // ─── Icons ────────────────────────────────────────────────────────────
  { id: 'icon-classic', name: 'Classic Icon', name_ar: 'أيقونة كلاسيكية', description: 'Classic style icon', description_ar: 'أيقونة بنمط كلاسيكي', category: 'icon', rarity: 'common', price_stars: 25, price_kernels: 350, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1567, tags: ['icon', 'classic'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'i1', type: 'icon', name: 'Classic Icon', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'icon-dark', name: 'Dark Icon', name_ar: 'أيقونة داكنة', description: 'Dark style icon', description_ar: 'أيقونة داكنة', category: 'icon', rarity: 'common', price_stars: 25, price_kernels: 350, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1345, tags: ['icon', 'dark'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'i2', type: 'icon', name: 'Dark Icon', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'icon-neon', name: 'Neon Icon', name_ar: 'أيقونة نيون', description: 'Neon glow icon', description_ar: 'أيقونة نيون متوهجة', category: 'icon', rarity: 'rare', price_stars: 25, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 890, tags: ['icon', 'neon'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'i3', type: 'icon', name: 'Neon Icon', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'icon-minimal', name: 'Minimal Icon', name_ar: 'أيقونة بسيطة', description: 'Minimal clean icon', description_ar: 'أيقونة بسيطة ونظيفة', category: 'icon', rarity: 'common', price_stars: 25, price_kernels: 350, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 1100, tags: ['icon', 'minimal'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'i4', type: 'icon', name: 'Minimal Icon', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'icon-3d', name: '3D Icon', name_ar: 'أيقونة ثلاثية الأبعاد', description: '3D rendered icon', description_ar: 'أيقونة ثلاثية الأبعاد', category: 'icon', rarity: 'rare', price_stars: 25, price_kernels: 500, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 780, tags: ['icon', '3d'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'i5', type: 'icon', name: '3D Icon', file_url: '', preview_url: '', metadata: {} }] },

  // ─── Backgrounds ──────────────────────────────────────────────────────
  { id: 'bg-cosmic', name: 'Cosmic Dust', name_ar: 'غبار كوني', description: 'Cosmic dust background', description_ar: 'خلفية الغبار الكوني', category: 'background', rarity: 'common', price_stars: 35, price_kernels: 400, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 678, tags: ['background', 'cosmic'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'bg1', type: 'background', name: 'Cosmic BG', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'bg-ocean', name: 'Ocean Wave', name_ar: 'موجة محيط', description: 'Ocean wave background', description_ar: 'خلفية موجة المحيط', category: 'background', rarity: 'common', price_stars: 35, price_kernels: 400, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 567, tags: ['background', 'ocean'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'bg2', type: 'background', name: 'Ocean BG', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'bg-abstract', name: 'Abstract Shapes', name_ar: 'أشكال تجريدية', description: 'Abstract geometric shapes', description_ar: 'أشكال هندسية تجريدية', category: 'background', rarity: 'rare', price_stars: 35, price_kernels: 700, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 456, tags: ['background', 'abstract'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'bg3', type: 'background', name: 'Abstract BG', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'bg-wood', name: 'Wood Texture', name_ar: 'نسيج خشبي', description: 'Natural wood grain', description_ar: 'نسيج خشبي طبيعي', category: 'background', rarity: 'common', price_stars: 35, price_kernels: 400, payment_method: 'kernels', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 345, tags: ['background', 'wood'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'bg4', type: 'background', name: 'Wood BG', file_url: '', preview_url: '', metadata: {} }] },
  { id: 'bg-marble', name: 'Marble', name_ar: 'رخام', description: 'Elegant marble texture', description_ar: 'نسيج رخامي أنيق', category: 'background', rarity: 'rare', price_stars: 35, price_kernels: 700, payment_method: 'both', image_url: '', preview_images: [], is_purchasable: true, is_limited: false, sold_count: 234, tags: ['background', 'marble'], created_at: '2024-01-01', updated_at: '2024-01-01', assets: [{ id: 'bg5', type: 'background', name: 'Marble BG', file_url: '', preview_url: '', metadata: {} }] },
]

// ─── Mock Comments ──────────────────────────────────────────────────────────────

const MOCK_COMMENTS: MockComment[] = [
  { id: 1, user_id: 1001, tmdb_id: 550988, media_type: 'movie', parent_id: null, content: 'Amazing movie! Ryan Reynolds was perfect for this role 🎬', is_spoiler: false, likes_count: 24, dislikes_count: 1, replies_count: 3, status: 'active', created_at: '2024-06-15T10:30:00Z', updated_at: '2024-06-15T10:30:00Z', username: 'movie_lover', first_name: 'Sarah', photo_url: '', user_like_type: null, replies: [
    { id: 11, user_id: 1002, tmdb_id: 550988, media_type: 'movie', parent_id: 1, content: 'Totally agree! The comedy was spot on', is_spoiler: false, likes_count: 5, dislikes_count: 0, replies_count: 0, status: 'active', created_at: '2024-06-15T11:00:00Z', updated_at: '2024-06-15T11:00:00Z', username: 'cinema_fan', first_name: 'Alex', photo_url: '' },
    { id: 12, user_id: 1003, tmdb_id: 550988, media_type: 'movie', parent_id: 1, content: 'The scene where he discovers the code was hilarious', is_spoiler: true, likes_count: 8, dislikes_count: 0, replies_count: 0, status: 'active', created_at: '2024-06-15T12:00:00Z', updated_at: '2024-06-15T12:00:00Z', username: 'gamer_dev', first_name: 'Mike', photo_url: '' },
    { id: 13, user_id: 1001, tmdb_id: 550988, media_type: 'movie', parent_id: 1, content: '@cinema_fan right? 😂', is_spoiler: false, likes_count: 2, dislikes_count: 0, replies_count: 0, status: 'active', created_at: '2024-06-15T12:30:00Z', updated_at: '2024-06-15T12:30:00Z', username: 'movie_lover', first_name: 'Sarah', photo_url: '' },
  ] },
  { id: 2, user_id: 1004, tmdb_id: 550988, media_type: 'movie', parent_id: null, content: 'The visual effects were incredible. Loved every minute of it!', is_spoiler: false, likes_count: 18, dislikes_count: 2, replies_count: 1, status: 'active', created_at: '2024-06-16T09:00:00Z', updated_at: '2024-06-16T09:00:00Z', username: 'vfx_artist', first_name: 'Emma', photo_url: '', user_like_type: 'like', replies: [
    { id: 21, user_id: 1005, tmdb_id: 550988, media_type: 'movie', parent_id: 2, content: 'The green screen work was seamless', is_spoiler: false, likes_count: 3, dislikes_count: 0, replies_count: 0, status: 'active', created_at: '2024-06-16T10:00:00Z', updated_at: '2024-06-16T10:00:00Z', username: 'tech_nerd', first_name: 'David', photo_url: '' },
  ] },
  { id: 3, user_id: 1006, tmdb_id: 550988, media_type: 'movie', parent_id: null, content: 'Not their best work honestly. Expected more from the director.', is_spoiler: false, likes_count: 6, dislikes_count: 12, replies_count: 0, status: 'active', created_at: '2024-06-17T14:00:00Z', updated_at: '2024-06-17T14:00:00Z', username: 'critic_one', first_name: 'John', photo_url: '' },
  { id: 4, user_id: 1007, tmdb_id: 550988, media_type: 'movie', parent_id: null, content: '⚠️ SPOILER: The ending where Guy becomes real was emotional', is_spoiler: true, likes_count: 15, dislikes_count: 3, replies_count: 0, status: 'active', created_at: '2024-06-18T08:00:00Z', updated_at: '2024-06-18T08:00:00Z', username: 'plot_twist', first_name: 'Lisa', photo_url: '' },
  // Series comments
  { id: 5, user_id: 1008, tmdb_id: 1396, media_type: 'series', parent_id: null, content: 'Best series ever made! Bryan Cranston is a genius 🧪', is_spoiler: false, likes_count: 89, dislikes_count: 2, replies_count: 4, status: 'active', created_at: '2024-06-10T10:00:00Z', updated_at: '2024-06-10T10:00:00Z', username: 'heisenberg_fan', first_name: 'Walter', photo_url: '', user_like_type: null, replies: [] },
]

// ─── Mock Party Rooms ───────────────────────────────────────────────────────────

const MOCK_PARTY_ROOMS: MockPartyRoom[] = [
  {
    id: 'party-1',
    room_code: 'ABC123',
    host_user_id: 5703679073,
    title: 'Free Guy Watch Party 🎮',
    media_type: 'movie',
    media_id: 550988,
    visibility: 'public',
    status: 'active',
    max_participants: 50,
    participant_count: 3,
    participants: [
      { id: 'p1', user_id: 5703679073, name: 'مطور PopCorn', avatar_url: '', role: 'leader', is_ready: true, is_online: true, joined_at: '2024-06-20T10:00:00Z' },
      { id: 'p2', user_id: 1001, name: 'Sarah', avatar_url: '', role: 'follower', is_ready: true, is_online: true, joined_at: '2024-06-20T10:01:00Z' },
      { id: 'p3', user_id: 1002, name: 'Alex', avatar_url: '', role: 'follower', is_ready: false, is_online: true, joined_at: '2024-06-20T10:02:00Z' },
    ],
    created_at: '2024-06-20T10:00:00Z',
  },
  {
    id: 'party-2',
    room_code: 'XYZ789',
    host_user_id: 1003,
    title: 'Breaking Bad Marathon 🧪',
    media_type: 'series',
    media_id: 1396,
    visibility: 'public',
    status: 'waiting',
    max_participants: 20,
    participant_count: 1,
    participants: [
      { id: 'p4', user_id: 1003, name: 'Mike', avatar_url: '', role: 'leader', is_ready: true, is_online: true, joined_at: '2024-06-21T14:00:00Z' },
    ],
    created_at: '2024-06-21T14:00:00Z',
  },
]

// ─── Mock Notifications ─────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: MockNotification[] = [
  { id: 'n1', user_id: 5703679073, type: 'friend_request', title: 'Friend Request', body: 'Sarah sent you a friend request', data: { from_user_id: 1001 }, is_read: false, created_at: '2024-06-20T09:00:00Z' },
  { id: 'n2', user_id: 5703679073, type: 'comment_reply', title: 'New Reply', body: 'Alex replied to your comment on Free Guy', data: { comment_id: 1, tmdb_id: 550988 }, is_read: true, created_at: '2024-06-19T15:00:00Z' },
  { id: 'n3', user_id: 5703679073, type: 'party_invite', title: 'Party Invite', body: 'Mike invited you to Breaking Bad Marathon', data: { room_code: 'XYZ789' }, is_read: false, created_at: '2024-06-21T14:00:00Z' },
  { id: 'n4', user_id: 5703679073, type: 'purchase_completed', title: 'Purchase Complete', body: 'Ocean Depths theme purchased successfully!', data: { product_id: 'theme-ocean' }, is_read: true, created_at: '2024-06-18T10:00:00Z' },
  { id: 'n5', user_id: 5703679073, type: 'achievement_unlocked', title: 'Achievement Unlocked!', body: 'You earned the 7-Day Streak badge', data: { badge_id: 'badge-streak-7' }, is_read: false, created_at: '2024-06-20T08:00:00Z' },
]

// ─── Mock Conversations ─────────────────────────────────────────────────────────

const MOCK_CONVERSATIONS: MockConversation[] = [
  { id: 'c1', last_message: 'Hey! Want to watch Free Guy together?', last_message_at: '2024-06-20T10:30:00Z', unread_count: 2, other_user: { id: 1001, name: 'Sarah', avatar_url: '', is_online: true } },
  { id: 'c2', last_message: 'Breaking Bad is starting at 8 PM', last_message_at: '2024-06-19T19:00:00Z', unread_count: 0, other_user: { id: 1003, name: 'Mike', avatar_url: '', is_online: false } },
]

const MOCK_MESSAGES: MockMessage[] = [
  { id: 'm1', sender_id: 1001, content: 'Hey! Want to watch Free Guy together?', created_at: '2024-06-20T10:30:00Z' },
  { id: 'm2', sender_id: 5703679073, content: 'Sure! Let me start a party', created_at: '2024-06-20T10:31:00Z' },
  { id: 'm3', sender_id: 1001, content: 'Great! I\'ll invite Alex too', created_at: '2024-06-20T10:32:00Z' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────────

function paginatedResponse<T>(items: T[], page = 1, perPage = 20) {
  const start = (page - 1) * perPage
  const paginated = items.slice(start, start + perPage)
  return {
    items: paginated,
    total: items.length,
    page,
    has_more: start + perPage < items.length,
    per_page: perPage,
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────────

export const handlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('/api/v1/auth/init', async ({ request }) => {
    const body = (await request.json()) as { initDataRaw: string } | undefined
    if (!body?.initDataRaw) {
      return HttpResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: 'Missing initData' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({
      user: MOCK_USER,
      token: 'mock-jwt-token-12345',
      is_new: false,
    })
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({ user: MOCK_USER })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // MOVIES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/movies', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const sort = url.searchParams.get('sort_by') ?? 'popularity'
    const perPage = parseInt(url.searchParams.get('per_page') ?? '20', 10)

    const sorted = [...MOCK_MOVIES]
    if (sort === 'release_date') {
      sorted.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
    } else if (sort === 'vote_average') {
      sorted.sort((a, b) => b.vote_average - a.vote_average)
    }

    return HttpResponse.json(paginatedResponse(sorted, page, perPage))
  }),

  http.get('/api/v1/movies/:id', ({ params }) => {
    const id = Number(params.id)
    const movie = MOCK_MOVIES.find((m) => m.tmdb_id === id)
    if (!movie) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json({ data: movie })
  }),

  http.get('/api/v1/movies/:id/credits', ({ params }) => {
    const id = Number(params.id)
    const movie = MOCK_MOVIES.find((m) => m.tmdb_id === id)
    if (!movie) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json({ cast: MOCK_CAST, crew: MOCK_CREW })
  }),

  http.get('/api/v1/movies/:id/similar', ({ params }) => {
    const id = Number(params.id)
    const movie = MOCK_MOVIES.find((m) => m.tmdb_id === id)
    if (!movie) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
        { status: 404 },
      )
    }
    const similar = MOCK_MOVIES.filter((m) => m.tmdb_id !== id)
    return HttpResponse.json(paginatedResponse(similar))
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAMING
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/stream/movie/:id', ({ params }) => {
    const id = Number(params.id)
    const movie = MOCK_MOVIES.find((m) => m.tmdb_id === id)
    if (!movie) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Movie not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      fallback_used: false,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
  }),

  http.get('/api/v1/stream/episode/:id', ({ request }) => {
    const url = new URL(request.url)
    const season = url.searchParams.get('season')
    const episode = url.searchParams.get('episode')
    void season
    void episode
    return HttpResponse.json({
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      fallback_used: false,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    })
  }),

  http.post('/api/v1/stream/progress', async () => {
    return HttpResponse.json({ ok: true })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SERIES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/series/:id', ({ params }) => {
    const id = Number(params.id)
    if (id === MOCK_SERIES.tmdb_id) {
      return HttpResponse.json({ data: MOCK_SERIES })
    }
    return HttpResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Series not found' } },
      { status: 404 },
    )
  }),

  http.get('/api/v1/series/:id/season/:seasonNum', ({ params }) => {
    const seasonNum = Number(params.seasonNum)
    if (seasonNum === MOCK_SEASON.season_number) {
      return HttpResponse.json({ data: MOCK_SEASON })
    }
    return HttpResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Season not found' } },
      { status: 404 },
    )
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // STORE
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/store/products', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const perPage = parseInt(url.searchParams.get('per_page') ?? '20', 10)
    const category = url.searchParams.get('category')

    let filtered = MOCK_PRODUCTS
    if (category && category !== 'all') {
      filtered = MOCK_PRODUCTS.filter((p) => p.category === category)
    }

    return HttpResponse.json({
      data: filtered,
      items: paginatedResponse(filtered, page, perPage),
    })
  }),

  http.get('/api/v1/store/products/:id', ({ params }) => {
    const id = String(params.id)
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 },
      )
    }
    return HttpResponse.json({ data: product })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('/api/v1/payments/create-invoice', async ({ request }) => {
    const body = (await request.json()) as { product_id: string; idempotency_key: string }
    const product = MOCK_PRODUCTS.find((p) => p.id === body.product_id)
    if (!product) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 },
      )
    }

    await delay(300)

    return HttpResponse.json({
      data: {
        invoice_link: `https://t.me/invoice/${body.product_id}`,
        payload: `${body.product_id}:${body.idempotency_key}`,
        product,
      },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // USER ASSETS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/user/me/assets', () => {
    const ownedAssets = [
      { id: 'ua1', user_id: 5703679073, product_id: 'theme-ocean', product: MOCK_PRODUCTS.find((p) => p.id === 'theme-ocean'), asset: MOCK_PRODUCTS.find((p) => p.id === 'theme-ocean')?.assets[0], is_active: true, activated_at: '2024-06-18T10:00:00Z', purchased_at: '2024-06-18T10:00:00Z' },
      { id: 'ua2', user_id: 5703679073, product_id: 'frame-pulse', product: MOCK_PRODUCTS.find((p) => p.id === 'frame-pulse'), asset: MOCK_PRODUCTS.find((p) => p.id === 'frame-pulse')?.assets[0], is_active: false, purchased_at: '2024-06-15T10:00:00Z' },
      { id: 'ua3', user_id: 5703679073, product_id: 'badge-early-bird', product: MOCK_PRODUCTS.find((p) => p.id === 'badge-early-bird'), asset: MOCK_PRODUCTS.find((p) => p.id === 'badge-early-bird')?.assets[0], is_active: true, activated_at: '2024-01-01T00:00:00Z', purchased_at: '2024-01-01T00:00:00Z' },
    ]

    return HttpResponse.json({
      data: ownedAssets.filter((a) => a.product && a.asset),
      items: { total: ownedAssets.length },
    })
  }),

  http.post('/api/v1/user/me/asset/activate', async ({ request }) => {
    const body = (await request.json()) as { asset_item_id: string; product_id: string }
    void body
    return HttpResponse.json({
      data: {
        activated: { id: 'ua-activated', is_active: true, activated_at: new Date().toISOString() },
        deactivated: undefined,
      },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/movie/:id/comments', ({ params, request }) => {
    const id = Number(params.id)
    const url = new URL(request.url)
    const sort = url.searchParams.get('sort') ?? 'newest'
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)

    const comments = MOCK_COMMENTS.filter((c) => c.tmdb_id === id && c.media_type === 'movie' && c.parent_id === null)

    if (sort === 'popular') {
      comments.sort((a, b) => b.likes_count - a.likes_count)
    } else if (sort === 'oldest') {
      comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else {
      comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return HttpResponse.json({
      data: comments,
      items: { total: comments.length, page, limit: 20, has_more: false },
    })
  }),

  http.get('/api/v1/series/:id/comments', ({ params, request }) => {
    const id = Number(params.id)
    const url = new URL(request.url)
    const sort = url.searchParams.get('sort') ?? 'newest'
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)

    const comments = MOCK_COMMENTS.filter((c) => c.tmdb_id === id && c.media_type === 'series' && c.parent_id === null)

    if (sort === 'popular') {
      comments.sort((a, b) => b.likes_count - a.likes_count)
    } else {
      comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return HttpResponse.json({
      data: comments,
      items: { total: comments.length, page, limit: 20, has_more: false },
    })
  }),

  http.post('/api/v1/comment', async ({ request }) => {
    const body = (await request.json()) as { tmdb_id: number; media_type: string; content: string; is_spoiler?: boolean; parent_id?: number; mention_ids?: string[] }
    const newComment: MockComment = {
      id: Date.now(),
      user_id: 5703679073,
      tmdb_id: body.tmdb_id,
      media_type: body.media_type,
      parent_id: body.parent_id ?? null,
      content: body.content,
      is_spoiler: body.is_spoiler ?? false,
      likes_count: 0,
      dislikes_count: 0,
      replies_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      username: 'MLk_JAMAL',
      first_name: 'مطور',
      photo_url: '',
    }

    return HttpResponse.json({ data: newComment })
  }),

  http.post('/api/v1/comment/:id/like', async ({ params }) => {
    const id = Number(params.id)
    void id
    return HttpResponse.json({
      data: { like: { id: Date.now(), user_id: 5703679073, comment_id: id, type: 'like', created_at: new Date().toISOString() } },
    })
  }),

  http.post('/api/v1/comment/:id/report', async ({ params }) => {
    const id = Number(params.id)
    return HttpResponse.json({
      data: { id: Date.now(), reporter_id: 5703679073, comment_id: id, reason: 'other', status: 'pending', created_at: new Date().toISOString() },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // RATINGS
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('/api/v1/user/rating', async ({ request }) => {
    const body = (await request.json()) as { tmdb_id: number; media_type: string; rating: number; review?: string; is_spoiler?: boolean }
    return HttpResponse.json({
      data: {
        id: Date.now(),
        user_id: 5703679073,
        tmdb_id: body.tmdb_id,
        media_type: body.media_type,
        rating: body.rating,
        review: body.review,
        is_spoiler: body.is_spoiler ?? false,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        username: 'MLk_JAMAL',
        first_name: 'مطور',
      },
    })
  }),

  http.get('/api/v1/user/me/ratings', () => {
    return HttpResponse.json({
      data: [
        { id: 1, user_id: 5703679073, tmdb_id: 550988, media_type: 'movie', rating: 8, review: 'Great movie!', is_spoiler: false, helpful_count: 5, created_at: '2024-06-15T10:00:00Z', updated_at: '2024-06-15T10:00:00Z', username: 'MLk_JAMAL', first_name: 'مطور' },
        { id: 2, user_id: 5703679073, tmdb_id: 1396, media_type: 'series', rating: 10, review: 'Best series ever!', is_spoiler: false, helpful_count: 12, created_at: '2024-06-10T10:00:00Z', updated_at: '2024-06-10T10:00:00Z', username: 'MLk_JAMAL', first_name: 'مطور' },
      ],
      items: { total: 2, page: 1, limit: 20, has_more: false },
    })
  }),

  http.post('/api/v1/rating/:id/helpful', async ({ params }) => {
    const id = Number(params.id)
    void id
    return HttpResponse.json({ data: { helpful: true, count: 6 } })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WATCH PARTIES
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('/api/v1/party/create', async ({ request }) => {
    const body = (await request.json()) as { title: string; media_type: string; media_id: number; visibility?: string; password?: string; max_participants?: number }
    const roomCode = 'ABC' + Math.random().toString(36).substring(2, 5).toUpperCase()
    const newRoom: MockPartyRoom = {
      id: `party-${Date.now()}`,
      room_code: roomCode,
      host_user_id: 5703679073,
      title: body.title,
      media_type: body.media_type,
      media_id: body.media_id,
      visibility: body.visibility ?? 'public',
      status: 'waiting',
      max_participants: body.max_participants ?? 50,
      participant_count: 1,
      participants: [
        { id: `p-${Date.now()}`, user_id: 5703679073, name: 'مطور PopCorn', avatar_url: '', role: 'leader', is_ready: true, is_online: true, joined_at: new Date().toISOString() },
      ],
      created_at: new Date().toISOString(),
    }
    MOCK_PARTY_ROOMS.push(newRoom)

    return HttpResponse.json({
      data: {
        room: newRoom,
        room_code: roomCode,
        share_link: `https://t.me/PopCornMinibot/start?startapp=party_${roomCode}`,
      },
    })
  }),

  http.post('/api/v1/party/join', async ({ request }) => {
    const body = (await request.json()) as { room_code: string; password?: string }
    const room = MOCK_PARTY_ROOMS.find((r) => r.room_code === body.room_code)
    if (!room) {
      return HttpResponse.json(
        { ok: false, error: { code: 'ROOM_NOT_FOUND', message: 'Party room not found' } },
        { status: 404 },
      )
    }

    if (room.participant_count >= room.max_participants) {
      return HttpResponse.json(
        { ok: false, error: { code: 'ROOM_FULL', message: 'Party room is full' } },
        { status: 409 },
      )
    }

    return HttpResponse.json({
      data: {
        room,
        ws_url: `wss://api.popcorn.com/ws/party/${body.room_code}`,
      },
    })
  }),

  http.get('/api/v1/party/public', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const publicRooms = MOCK_PARTY_ROOMS.filter((r) => r.visibility === 'public')

    return HttpResponse.json({
      data: publicRooms,
      items: { total: publicRooms.length, page, limit: 20, has_more: false },
    })
  }),

  http.get('/api/v1/party/friends/:userId', ({ params }) => {
    const userId = Number(params.userId)
    void userId
    return HttpResponse.json({
      data: [],
      items: { total: 0, page: 1, limit: 20, has_more: false },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/notifications', () => {
    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length

    return HttpResponse.json({
      data: MOCK_NOTIFICATIONS,
      items: { total: MOCK_NOTIFICATIONS.length, unread_count: unreadCount, has_more: false },
    })
  }),

  http.post('/api/v1/notifications/:id/read', async ({ params }) => {
    const id = String(params.id)
    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id)
    if (notification) {
      notification.is_read = true
    }
    return HttpResponse.json({ data: notification ?? MOCK_NOTIFICATIONS[0] })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL / FRIENDS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/social/friends', () => {
    return HttpResponse.json({
      data: [
        { id: 'f1', user_id: 5703679073, friend_id: 1001, friend_user: { id: 1001, name: 'Sarah', avatar_url: '', is_online: true, last_seen_at: '2024-06-20T10:00:00Z' }, status: 'friends', created_at: '2024-06-01T00:00:00Z' },
        { id: 'f2', user_id: 5703679073, friend_id: 1002, friend_user: { id: 1002, name: 'Alex', avatar_url: '', is_online: false, last_seen_at: '2024-06-19T18:00:00Z' }, status: 'friends', created_at: '2024-06-02T00:00:00Z' },
        { id: 'f3', user_id: 5703679073, friend_id: 1003, friend_user: { id: 1003, name: 'Mike', avatar_url: '', is_online: true, last_seen_at: '2024-06-20T10:00:00Z' }, status: 'friends', created_at: '2024-06-03T00:00:00Z' },
      ],
      items: { total: 3 },
    })
  }),

  http.get('/api/v1/social/requests', () => {
    return HttpResponse.json({
      data: [
        { id: 'fr1', from_user_id: 1004, to_user_id: 5703679073, from_user: { id: 1004, name: 'Emma', avatar_url: '' }, status: 'pending', created_at: '2024-06-20T09:00:00Z' },
      ],
      items: { total: 1 },
    })
  }),

  http.post('/api/v1/social/friends/request', async ({ request }) => {
    const body = (await request.json()) as { to_user_id: number }
    void body
    return HttpResponse.json({
      data: { id: `fr-${Date.now()}`, status: 'pending', created_at: new Date().toISOString() },
    })
  }),

  http.post('/api/v1/social/friends/accept', async ({ request }) => {
    const body = (await request.json()) as { request_id: string }
    void body
    return HttpResponse.json({ data: { status: 'accepted' } })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT / CONVERSATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/chat/conversations', () => {
    return HttpResponse.json({
      data: MOCK_CONVERSATIONS,
      items: { total: MOCK_CONVERSATIONS.length },
    })
  }),

  http.get('/api/v1/chat/conversations/:id/messages', ({ params }) => {
    const id = String(params.id)
    void id
    return HttpResponse.json({
      data: MOCK_MESSAGES,
      items: { total: MOCK_MESSAGES.length, page: 1, limit: 50, has_more: false },
    })
  }),

  http.post('/api/v1/chat/conversations/:id/messages', async ({ params, request }) => {
    const id = String(params.id)
    const body = (await request.json()) as { content: string }
    const newMessage: MockMessage = {
      id: `m-${Date.now()}`,
      sender_id: 5703679073,
      content: body.content,
      created_at: new Date().toISOString(),
    }
    void id

    return HttpResponse.json({ data: newMessage })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/leaderboard', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') ?? 'all'
    void period

    return HttpResponse.json({
      data: [
        { rank: 1, user_id: 1001, name: 'Sarah', avatar_url: '', score: 12500, watch_time: 3600 },
        { rank: 2, user_id: 5703679073, name: 'مطور PopCorn', avatar_url: '', score: 11000, watch_time: 3200 },
        { rank: 3, user_id: 1003, name: 'Mike', avatar_url: '', score: 9800, watch_time: 2800 },
        { rank: 4, user_id: 1002, name: 'Alex', avatar_url: '', score: 8500, watch_time: 2400 },
        { rank: 5, user_id: 1004, name: 'Emma', avatar_url: '', score: 7200, watch_time: 2000 },
      ],
      items: { total: 5, page: 1, limit: 20, has_more: false },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ACHIEVEMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/achievements', () => {
    return HttpResponse.json({
      data: [
        { id: 'ach1', name: 'First Movie', description: 'Watch your first movie', icon_url: '', progress: 1, total: 1, is_unlocked: true, unlocked_at: '2024-01-15T00:00:00Z' },
        { id: 'ach2', name: 'Movie Buff', description: 'Watch 50 movies', icon_url: '', progress: 32, total: 50, is_unlocked: false },
        { id: 'ach3', name: 'Series Expert', description: 'Complete 10 series', icon_url: '', progress: 5, total: 10, is_unlocked: false },
        { id: 'ach4', name: 'Party Animal', description: 'Join 20 watch parties', icon_url: '', progress: 12, total: 20, is_unlocked: false },
        { id: 'ach5', name: 'Social Butterfly', description: 'Add 25 friends', icon_url: '', progress: 3, total: 25, is_unlocked: false },
        { id: 'ach6', name: 'Critic', description: 'Write 10 reviews', icon_url: '', progress: 2, total: 10, is_unlocked: false },
      ],
      items: { total: 6 },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WATCH HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/user/me/history', () => {
    return HttpResponse.json({
      data: [
        { id: 'h1', tmdb_id: 550988, media_type: 'movie', title: 'Free Guy', poster_url: '', progress: 85, last_position: 5940, duration: 6900, updated_at: '2024-06-20T10:00:00Z' },
        { id: 'h2', tmdb_id: 1396, media_type: 'series', title: 'Breaking Bad', poster_url: '', progress: 45, last_position: 1350, duration: 3000, season: 1, episode: 1, updated_at: '2024-06-19T20:00:00Z' },
        { id: 'h3', tmdb_id: 299536, media_type: 'movie', title: 'Avengers: Infinity War', poster_url: '', progress: 100, last_position: 8940, duration: 8940, updated_at: '2024-06-18T15:00:00Z' },
      ],
      items: { total: 3, page: 1, limit: 20, has_more: false },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // WALLET
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/user/me/wallet', () => {
    return HttpResponse.json({
      data: {
        stars_balance: MOCK_USER.stars_balance,
        kernels_balance: MOCK_USER.kernels_balance,
        total_earned_kernels: MOCK_USER.total_earned_kernels,
        total_spent_kernels: MOCK_USER.total_spent_kernels,
      },
    })
  }),

  http.get('/api/v1/user/me/wallet/kernels', () => {
    return HttpResponse.json({
      data: {
        balance: MOCK_USER.kernels_balance,
        total_earned: MOCK_USER.total_earned_kernels,
        total_spent: MOCK_USER.total_spent_kernels,
      },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY STREAK
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/user/me/daily-streak', () => {
    const today = new Date().toISOString().split('T')[0]
    return HttpResponse.json({
      data: {
        current_streak: 5,
        longest_streak: 12,
        last_claim_date: today,
        today_claimed: true,
        reward_today: 50,
        next_reward: 60,
      },
    })
  }),

  http.post('/api/v1/user/me/daily-streak/claim', async () => {
    const reward = 60
    MOCK_USER.kernels_balance += reward
    MOCK_USER.total_earned_kernels += reward
    return HttpResponse.json({
      data: {
        claimed: true,
        reward,
        new_streak: 6,
        kernels_balance: MOCK_USER.kernels_balance,
      },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // EARNING HISTORY
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('/api/v1/user/me/earnings', ({ request }) => {
    const url = new URL(request.url)
    const _page = parseInt(url.searchParams.get('page') ?? '1', 10)
    void _page

    const earnings = [
      { id: 'e1', path: 'daily_streak', amount: 50, description: 'Day 5 daily streak reward', created_at: '2024-06-20T08:00:00Z' },
      { id: 'e2', path: 'watch_to_earn', amount: 5, description: 'Watched Free Guy for 10 minutes', created_at: '2024-06-20T10:10:00Z' },
      { id: 'e3', path: 'social', amount: 15, description: 'Wrote a review for Free Guy', created_at: '2024-06-20T10:30:00Z' },
      { id: 'e4', path: 'watch_to_earn', amount: 5, description: 'Watched Breaking Bad S1E1 for 10 minutes', created_at: '2024-06-19T20:10:00Z' },
      { id: 'e5', path: 'daily_streak', amount: 40, description: 'Day 4 daily streak reward', created_at: '2024-06-19T08:00:00Z' },
      { id: 'e6', path: 'social', amount: 30, description: 'Created watch party with friends', created_at: '2024-06-18T15:00:00Z' },
      { id: 'e7', path: 'daily_streak', amount: 30, description: 'Day 3 daily streak reward', created_at: '2024-06-18T08:00:00Z' },
      { id: 'e8', path: 'watch_to_earn', amount: 5, description: 'Watched Avengers for 10 minutes', created_at: '2024-06-17T14:10:00Z' },
      { id: 'e9', path: 'daily_streak', amount: 20, description: 'Day 2 daily streak reward', created_at: '2024-06-17T08:00:00Z' },
      { id: 'e10', path: 'daily_streak', amount: 10, description: 'Day 1 daily streak reward', created_at: '2024-06-16T08:00:00Z' },
      { id: 'e11', path: 'social', amount: 2, description: 'Got a like on your comment', created_at: '2024-06-16T12:00:00Z' },
      { id: 'e12', path: 'social', amount: 2, description: 'Got a like on your review', created_at: '2024-06-15T18:00:00Z' },
    ]

    return HttpResponse.json({
      data: earnings,
      items: { total: earnings.length },
    })
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // HYBRID PURCHASE
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('/api/v1/payments/hybrid-purchase', async ({ request }) => {
    const body = (await request.json()) as { product_id: string; currency: string; idempotency_key: string }
    const product = MOCK_PRODUCTS.find((p) => p.id === body.product_id)
    if (!product) {
      return HttpResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
        { status: 404 },
      )
    }

    await delay(400)

    if (body.currency === 'kernels') {
      const cost = product.price_kernels ?? 0
      if (MOCK_USER.kernels_balance < cost) {
        return HttpResponse.json(
          { ok: false, error: { code: 'INSUFFICIENT_BALANCE', message: 'Not enough kernels' } },
          { status: 402 },
        )
      }
      MOCK_USER.kernels_balance -= cost
      MOCK_USER.total_spent_kernels += cost

      return HttpResponse.json({
        data: {
          product_id: product.id,
          currency: 'kernels',
          amount: cost,
          new_stars_balance: MOCK_USER.stars_balance,
          new_kernels_balance: MOCK_USER.kernels_balance,
        },
      })
    }

    if (body.currency === 'stars') {
      const cost = product.price_stars
      if (MOCK_USER.stars_balance < cost) {
        return HttpResponse.json(
          { ok: false, error: { code: 'INSUFFICIENT_BALANCE', message: 'Not enough stars' } },
          { status: 402 },
        )
      }
      MOCK_USER.stars_balance -= cost

      return HttpResponse.json({
        data: {
          invoice_link: `https://t.me/invoice/${body.product_id}`,
          payload: `${body.product_id}:${body.idempotency_key}`,
          product_id: product.id,
          currency: 'stars',
          amount: cost,
          new_stars_balance: MOCK_USER.stars_balance,
          new_kernels_balance: MOCK_USER.kernels_balance,
        },
      })
    }

    return HttpResponse.json(
      { ok: false, error: { code: 'INVALID_CURRENCY', message: 'Invalid currency type' } },
      { status: 400 },
    )
  }),
]

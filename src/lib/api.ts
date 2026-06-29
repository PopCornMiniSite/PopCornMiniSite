import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/types/user'
import type { Movie, MovieCredits } from '@/types/movie'
import type { SeriesDetail, SeasonDetail } from '@/types/series'
import type { StreamUrlResponse, ProgressReport, ProgressResponse } from '@/types/stream'
import type { Product, StoreProductsResponse, UserAssetsResponse, ActivateAssetResponse } from '@/types/product'
import type { CreateInvoiceRequest, CreateInvoiceResponse } from '@/types/purchase'
import type { WalletResponse, KernelsBalanceResponse, DailyStreakResponse, ClaimDailyStreakResponse, EarningHistoryResponse, HybridPurchaseRequest, HybridPurchaseResponse } from '@/types/wallet'
import type { Comment, CommentSort, CreateCommentRequest, CreateCommentResponse, LikeCommentRequest, LikeCommentResponse, ReportCommentRequest, CreateRatingRequest, CreateRatingResponse, RatingsResponse } from '@/types/comment'
import type { CreatePartyRequest, CreatePartyResponse, JoinPartyRequest, JoinPartyResponse, PartyListResponse } from '@/types/party'
import type { NotificationsResponse, MarkNotificationReadResponse } from '@/types/notification'
import type { FriendsResponse, FriendRequestsResponse } from '@/types/user'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export interface AuthResponse {
  user: User
  token: string
  is_new: boolean
}

export interface ApiError {
  ok: false
  error: { code: string; message: string }
}

export class ApiRequestError extends Error {
  code: string
  status: number | undefined

  constructor(code: string, message: string, status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.code = code
    this.status = status
  }
}

const REQUEST_TIMEOUT = 15_000

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  initDataRaw?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (initDataRaw) {
    headers['Authorization'] = `tma ${initDataRaw}`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

  if (!response.ok) {
    clearTimeout(timeoutId)
    let errorData: ApiError
    try {
      errorData = (await response.json()) as ApiError
    } catch {
      errorData = {
        ok: false,
        error: { code: 'UNKNOWN', message: response.statusText },
      }
    }
    throw new ApiRequestError(
      errorData.error.code,
      errorData.error.message,
      response.status,
    )
  }

  clearTimeout(timeoutId)
  return response.json() as Promise<T>
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof ApiRequestError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiRequestError('TIMEOUT', 'Request timed out', 408)
    }
    throw new ApiRequestError('NETWORK', (err as Error).message || 'Network error')
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export function useInitAuth() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (initDataRaw: string) => {
      return apiRequest<{ ok: boolean; data: AuthResponse }>(
        '/api/v1/auth/init',
        {
          method: 'POST',
          body: JSON.stringify({ initDataRaw }),
        },
        initDataRaw,
      )
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.data.user)
    },
  })
}

export function useCurrentUser(initDataRaw: string | null) {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () =>
      apiRequest<{ ok: boolean; data: { user: User } }>('/api/v1/auth/me', {}, initDataRaw ?? undefined),
    enabled: !!initDataRaw,
    select: (data) => data.data.user,
  })
}

// ─── Movies ────────────────────────────────────────────────────────────────────

export function useMovies(params: { sort_by?: string; per_page?: number; page?: number } = {}) {
  const { sort_by = 'popularity', per_page = 20, page = 1 } = params

  return useQuery({
    queryKey: ['movies', { sort_by, per_page, page }],
    queryFn: () =>
      apiRequest<{ ok: boolean; data: Movie[]; meta: { total: number; page: number; per_page: number } }>(
        `/api/v1/movies?page=${page}&sort_by=${sort_by}&per_page=${per_page}`,
      ),
    select: (res) => ({
      items: res.data,
      total: res.meta.total,
      page: res.meta.page,
      has_more: res.meta.page * per_page < res.meta.total,
    }),
    staleTime: 60_000,
    refetchOnMount: 'always',
  })
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => apiRequest<{ data: Movie }>(`/api/v1/movies/${id}`),
    enabled: !!id,
    select: (data) => data.data,
  })
}

export function useMovieCredits(id: number) {
  return useQuery({
    queryKey: ['movie', id, 'credits'],
    queryFn: () => apiRequest<{ data: MovieCredits }>(`/api/v1/movies/${id}/credits`),
    enabled: !!id,
    select: (data) => data.data,
  })
}

export function useSimilarMovies(id: number) {
  return useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () =>
      apiRequest<{ ok: boolean; data: { items: Movie[] } }>(`/api/v1/movies/${id}/similar`),
    enabled: !!id,
    select: (res) => res.data.items,
  })
}

// ─── Streaming ─────────────────────────────────────────────────────────────────

export function useStreamUrl(
  contentType: 'movie' | 'episode',
  contentId: number,
  season?: number,
  episode?: number,
) {
  const path =
    contentType === 'movie'
      ? `/api/v1/stream/movie/${contentId}`
      : `/api/v1/stream/episode/${contentId}?season=${season ?? ''}&episode=${episode ?? ''}`

  return useQuery({
    queryKey: ['stream', contentType, contentId, season, episode],
    queryFn: () => apiRequest<{ ok: boolean; data: StreamUrlResponse }>(path),
    enabled: !!contentId,
    select: (res) => res.data,
  })
}

export function useReportProgress() {
  return useMutation({
    mutationFn: (report: ProgressReport) =>
      apiRequest<ProgressResponse>('/api/v1/stream/progress', {
        method: 'POST',
        body: JSON.stringify(report),
      }),
  })
}

// ─── Series ────────────────────────────────────────────────────────────────────

export function useSimilarSeries(id: number) {
  return useQuery({
    queryKey: ['series', id, 'similar'],
    queryFn: () =>
      apiRequest<{ ok: boolean; data: { items: Movie[] } }>(`/api/v1/series/${id}/similar`),
    enabled: !!id,
    select: (res) => res.data.items,
  })
}

export function useSeries(id: number) {
  return useQuery({
    queryKey: ['series', id],
    queryFn: () => apiRequest<{ data: SeriesDetail }>(`/api/v1/series/${id}`),
    enabled: !!id,
    select: (data) => data.data,
  })
}

export function useSeasonDetail(seriesId: number, seasonNumber: number) {
  return useQuery({
    queryKey: ['series', seriesId, 'season', seasonNumber],
    queryFn: () =>
      apiRequest<{ data: SeasonDetail }>(`/api/v1/series/${seriesId}/season/${seasonNumber}`),
    enabled: !!seriesId && seasonNumber > 0,
    select: (data) => data.data,
  })
}

// ─── Store & Products ──────────────────────────────────────────────────────────

export function useStoreProducts(category?: string) {
  return useQuery({
    queryKey: ['store', 'products', category],
    queryFn: () => {
      const params = category && category !== 'all' ? `?category=${category}` : ''
      return apiRequest<StoreProductsResponse>(`/api/v1/store/products${params}`)
    },
    select: (data) => data.data,
  })
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ['store', 'product', productId],
    queryFn: () => apiRequest<{ data: Product }>(`/api/v1/store/products/${productId}`),
    enabled: !!productId,
    select: (data) => data.data,
  })
}

export function useCreateInvoice() {
  return useMutation({
    mutationFn: (request: CreateInvoiceRequest) =>
      apiRequest<CreateInvoiceResponse>('/api/v1/payments/create-invoice', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    retry: 1,
  })
}

export function useUserAssets() {
  return useQuery({
    queryKey: ['user', 'assets'],
    queryFn: () => apiRequest<UserAssetsResponse>('/api/v1/user/me/assets'),
    select: (data) => data.data,
  })
}

export function useActivateAsset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: { asset_item_id: string; product_id: number }) =>
      apiRequest<ActivateAssetResponse>('/api/v1/user/me/asset/activate', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'assets'] })
    },
  })
}

// ─── Comments ──────────────────────────────────────────────────────────────────

export function useComments(
  tmdbId: number,
  mediaType: 'movie' | 'series',
  sort: CommentSort = 'newest',
  page = 1,
) {
  const endpoint =
    mediaType === 'movie'
      ? `/api/v1/movie/${tmdbId}/comments`
      : `/api/v1/series/${tmdbId}/comments`

  return useQuery({
    queryKey: ['comments', mediaType, tmdbId, sort, page],
    queryFn: () =>
      apiRequest<{
        data: Comment[]
        items: { total: number; page: number; limit: number; has_more: boolean }
      }>(`${endpoint}?sort=${sort}&page=${page}`),
    enabled: !!tmdbId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateCommentRequest) =>
      apiRequest<CreateCommentResponse>('/api/v1/comment', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', variables.media_type, variables.tmdb_id],
      })
    },
  })
}

export function useLikeComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, request }: { commentId: string; request: LikeCommentRequest }) =>
      apiRequest<LikeCommentResponse>(`/api/v1/comment/${commentId}/like`, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
    },
  })
}

export function useReportComment() {
  return useMutation({
    mutationFn: ({ commentId, request }: { commentId: string; request: ReportCommentRequest }) =>
      apiRequest<{ data: unknown }>(`/api/v1/comment/${commentId}/report`, {
        method: 'POST',
        body: JSON.stringify(request),
      }),
  })
}

// ─── Ratings ───────────────────────────────────────────────────────────────────

export function useCreateRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateRatingRequest) =>
      apiRequest<CreateRatingResponse>('/api/v1/user/rating', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ratings', variables.media_type, variables.tmdb_id],
      })
      queryClient.invalidateQueries({ queryKey: ['user', 'ratings'] })
    },
  })
}

export function useUserRatings() {
  return useQuery({
    queryKey: ['user', 'ratings'],
    queryFn: () => apiRequest<RatingsResponse>('/api/v1/user/me/ratings'),
    select: (data) => data.data,
  })
}

export function useRatingHelpful() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ratingId: number) =>
      apiRequest<{ data: { helpful: boolean; count: number } }>(
        `/api/v1/rating/${ratingId}/helpful`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'ratings'] })
    },
  })
}

// ─── Watch Parties ─────────────────────────────────────────────────────────────

export function useCreateParty() {
  return useMutation({
    mutationFn: (request: CreatePartyRequest) =>
      apiRequest<CreatePartyResponse>('/api/v1/party/create', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
  })
}

export function useJoinParty() {
  return useMutation({
    mutationFn: (request: JoinPartyRequest) =>
      apiRequest<JoinPartyResponse>('/api/v1/party/join', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
  })
}

export function usePublicParties() {
  return useQuery({
    queryKey: ['parties', 'public'],
    queryFn: () => apiRequest<PartyListResponse>('/api/v1/party/public'),
    select: (data) => data.data,
  })
}

export function useFriendParties(userId: number) {
  return useQuery({
    queryKey: ['parties', 'friends', userId],
    queryFn: () => apiRequest<PartyListResponse>(`/api/v1/party/friends/${userId}`),
    enabled: !!userId,
    select: (data) => data.data,
  })
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiRequest<NotificationsResponse>('/api/v1/notifications'),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<MarkNotificationReadResponse>(`/api/v1/notifications/${id}/read`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ─── Social / Friends ──────────────────────────────────────────────────────────

export function useFriends() {
  return useQuery({
    queryKey: ['social', 'friends'],
    queryFn: () => apiRequest<FriendsResponse>('/api/v1/social/friends'),
    select: (data) => data.data,
  })
}

export function useFriendRequests() {
  return useQuery({
    queryKey: ['social', 'requests'],
    queryFn: () => apiRequest<FriendRequestsResponse>('/api/v1/social/requests'),
    select: (data) => data.data,
  })
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: { to_user_id: number }) =>
      apiRequest<{ data: { id: string; status: string; created_at: string } }>(
        '/api/v1/social/friends/request',
        { method: 'POST', body: JSON.stringify(request) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'requests'] })
    },
  })
}

export function useAcceptFriendRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: { request_id: string }) =>
      apiRequest<{ data: { status: string } }>('/api/v1/social/friends/accept', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'friends'] })
      queryClient.invalidateQueries({ queryKey: ['social', 'requests'] })
    },
  })
}

// ─── Chat / Conversations ──────────────────────────────────────────────────────

export function useConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: () =>
      apiRequest<{
        data: Array<{
          id: string
          last_message: string
          last_message_at: string
          unread_count: number
          other_user: { id: number; name: string; avatar_url: string; is_online: boolean }
        }>
        items: { total: number }
      }>('/api/v1/chat/conversations'),
    select: (data) => data.data,
  })
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['chat', 'conversations', conversationId, 'messages'],
    queryFn: () =>
      apiRequest<{
        data: Array<{ id: string; sender_id: number; content: string; created_at: string }>
        items: { total: number; page: number; limit: number; has_more: boolean }
      }>(`/api/v1/chat/conversations/${conversationId}/messages`),
    enabled: !!conversationId,
    select: (data) => data.data,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      apiRequest<{
        data: { id: string; sender_id: number; content: string; created_at: string }
      }>(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'conversations', variables.conversationId, 'messages'],
      })
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

export function useLeaderboard(period: string = 'all') {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () =>
      apiRequest<{
        data: Array<{
          rank: number
          user_id: number
          name: string
          avatar_url: string
          score: number
          watch_time: number
        }>
        items: { total: number; page: number; limit: number; has_more: boolean }
      }>(`/api/v1/leaderboard?period=${period}`),
    select: (data) => data.data,
  })
}

// ─── Achievements ──────────────────────────────────────────────────────────────

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () =>
      apiRequest<{
        data: Array<{
          id: string
          name: string
          description: string
          icon_url: string
          progress: number
          total: number
          is_unlocked: boolean
          unlocked_at?: string
        }>
        items: { total: number }
      }>('/api/v1/achievements'),
    select: (data) => data.data,
  })
}

// ─── Watch History ─────────────────────────────────────────────────────────────

export function useWatchHistory(page = 1) {
  return useQuery({
    queryKey: ['user', 'history', page],
    queryFn: () =>
      apiRequest<{
        data: Array<{
          id: string
          tmdb_id: number
          media_type: string
          title: string
          poster_url: string
          progress: number
          last_position: number
          duration: number
          season?: number
          episode?: number
          updated_at: string
        }>
        items: { total: number; page: number; limit: number; has_more: boolean }
      }>(`/api/v1/user/me/history?page=${page}`),
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLET HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: () => apiRequest<WalletResponse>('/api/v1/user/me/wallet'),
    select: (data) => data.data,
  })
}

export function useKernelsBalance() {
  return useQuery({
    queryKey: ['wallet', 'kernels'],
    queryFn: () => apiRequest<KernelsBalanceResponse>('/api/v1/user/me/wallet/kernels'),
    select: (data) => data.data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// DAILY STREAK HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useDailyStreak() {
  return useQuery({
    queryKey: ['daily-streak'],
    queryFn: () => apiRequest<DailyStreakResponse>('/api/v1/user/me/daily-streak'),
    select: (data) => data.data,
  })
}

export function useClaimDailyStreak() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiRequest<ClaimDailyStreakResponse>('/api/v1/user/me/daily-streak/claim', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-streak'] })
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'kernels'] })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// EARNING HISTORY HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function useEarningHistory() {
  return useQuery({
    queryKey: ['earnings'],
    queryFn: () => apiRequest<EarningHistoryResponse>('/api/v1/user/me/earnings'),
    select: (data) => data.data,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// USER LIST (MY LIST) HOOKS
// ═══════════════════════════════════════════════════════════════════════════

interface ListItem {
  id: number
  user_id: number
  tmdb_id: number
  media_type: 'movie' | 'series'
  title: string
  poster_url?: string
  added_at: string
}

interface MyListResponse {
  ok: boolean
  data: ListItem[]
  items: { total: number; page: number; has_more: boolean }
}

export function useMyList() {
  return useQuery({
    queryKey: ['my-list'],
    queryFn: () => apiRequest<MyListResponse>('/api/v1/user/me/list'),
    select: (data) => ({
      items: data.data.map((item) => ({
        ...item,
        tmdb_id: Number(item.tmdb_id),
      })),
      total: data.items?.total ?? 0,
    }),
  })
}

export function useAddToList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { tmdb_id: number; media_type: string; title?: string; poster_url?: string }) =>
      apiRequest('/api/v1/user/me/list', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-list'] })
    },
  })
}

export function useRemoveFromList() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: { tmdb_id: number; media_type: string }) =>
      apiRequest('/api/v1/user/me/list', {
        method: 'DELETE',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-list'] })
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH HOOK
// ═══════════════════════════════════════════════════════════════════════════

interface SearchResult {
  id: number
  tmdb_id: number
  media_type: 'movie' | 'series'
  name: string
  poster_url?: string
  date?: string
  vote_average?: number
}

interface SearchResponse {
  ok: boolean
  data: SearchResult[]
  meta: { page: number; per_page: number; total: number; query: string }
}

export function useSearchQuery(query: string, type: string = 'all', page: number = 1) {
  return useQuery({
    queryKey: ['search', query, type, page],
    queryFn: () =>
      apiRequest<SearchResponse>(
        `/api/v1/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`
      ),
    enabled: query.trim().length > 0,
    select: (data) => ({
      items: data.data.map((item) => ({
        ...item,
        tmdb_id: Number(item.tmdb_id),
      })),
      total: data.meta?.total ?? 0,
      query: data.meta?.query ?? '',
    }),
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// HYBRID PURCHASE HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useHybridPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: HybridPurchaseRequest) =>
      apiRequest<HybridPurchaseResponse>('/api/v1/payments/hybrid-purchase', {
        method: 'POST',
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'kernels'] })
      queryClient.invalidateQueries({ queryKey: ['store', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'assets'] })
    },
    retry: 1,
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// PURCHASES HOOK
// ═══════════════════════════════════════════════════════════════════════════

interface PurchaseRecord {
  id: number
  product_id: number
  stars_amount: number
  status: string
  purchased_at: string
  name_ar?: string
  name_en?: string
  price_stars?: number
  price_kernels?: number
  image_url?: string
}

export function usePurchases() {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: () => apiRequest<{ ok: boolean; data: PurchaseRecord[] }>('/api/v1/user/me/purchases'),
    select: (data) => data.data ?? [],
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTERNAL USER PROFILE HOOK
// ═══════════════════════════════════════════════════════════════════════════

interface ExternalUserProfile {
  id: number
  user_id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  total_watch_time: number
  points: number
  stats: {
    watch_count: number
    friends_count: number
    badges_count: number
  }
}

export function useUserProfile(userId: number | string) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () =>
      apiRequest<{ ok: boolean; data: ExternalUserProfile }>(`/api/v1/user/user/${userId}`),
    enabled: !!userId,
    select: (data) => data.data,
  })
}

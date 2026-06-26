import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import { TelegramProvider, useTelegram } from '@/providers/TelegramProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { I18nProvider } from '@/providers/I18nProvider'
import { PageContainer } from '@/components/layout/PageContainer'
import { SuspenseWrapper } from '@/components/layout/SuspenseWrapper'
import { lazyLoad } from '@/lib/lazyLoad'
import { useInitAuth } from '@/lib/api'
import { Toaster } from 'sonner'
import './i18n/i18n'

const Home = lazyLoad(() => import('@/pages/Home'))
const Discover = lazyLoad(() => import('@/pages/Discover'))
const Store = lazyLoad(() => import('@/pages/Store'))
const Community = lazyLoad(() => import('@/pages/Community'))
const Profile = lazyLoad(() => import('@/pages/Profile'))
const Downloads = lazyLoad(() => import('@/pages/Downloads'))
const NotFound = lazyLoad(() => import('@/pages/NotFound'))
const MovieDetail = lazyLoad(() => import('@/pages/MovieDetail'))
const SeriesDetail = lazyLoad(() => import('@/pages/SeriesDetail'))
const SeasonDetail = lazyLoad(() => import('@/pages/SeasonDetail'))
const WatchPage = lazyLoad(() => import('@/pages/WatchPage'))
const ProductDetailPage = lazyLoad(() => import('@/pages/ProductDetail'))
const PurchasesPage = lazyLoad(() => import('@/pages/Purchases'))
const AssetsPage = lazyLoad(() => import('@/pages/Assets'))
const FriendsListPage = lazyLoad(() => import('@/pages/FriendsList'))
const ConversationsPage = lazyLoad(() => import('@/pages/Conversations'))
const ChatPage = lazyLoad(() => import('@/pages/ChatPage'))
const WatchPartyPage = lazyLoad(() => import('@/pages/WatchParty'))
const PartyCreatePage = lazyLoad(() => import('@/pages/PartyCreate'))
const PartyJoinPage = lazyLoad(() => import('@/pages/PartyJoin'))
const UserProfilePage = lazyLoad(() => import('@/pages/UserProfile'))
const SettingsPage = lazyLoad(() => import('@/pages/Settings'))
const LeaderboardPage = lazyLoad(() => import('@/pages/Leaderboard'))
const AchievementsPage = lazyLoad(() => import('@/pages/Achievements'))
const WatchHistoryPage = lazyLoad(() => import('@/pages/WatchHistory'))
const MyListPage = lazyLoad(() => import('@/pages/MyList'))
const SearchResultsPage = lazyLoad(() => import('@/pages/SearchResults'))
const NotificationsPage = lazyLoad(() => import('@/pages/Notifications'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthInit() {
  const { initDataRaw } = useTelegram()
  const auth = useInitAuth()

  useEffect(() => {
    if (initDataRaw && !auth.isSuccess && !auth.isPending) {
      auth.mutate(initDataRaw)
    }
  }, [initDataRaw, auth])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <ThemeProvider>
          <I18nProvider>
            <BrowserRouter basename="/PopCornMiniSite">
              <AuthInit />
              <Routes>
                <Route path="/" element={<PageContainer />}>
                  <Route
                    index
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Home />
                      </Suspense>
                    }
                  />
                  <Route
                    path="discover"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Discover />
                      </Suspense>
                    }
                  />
                  <Route
                    path="search"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <SearchResultsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="store"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Store />
                      </Suspense>
                    }
                  />
                  <Route
                    path="store/:productId"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <ProductDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="purchases"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <PurchasesPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="assets"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <AssetsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="downloads"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Downloads />
                      </Suspense>
                    }
                  />
                  <Route
                    path="community"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Community />
                      </Suspense>
                    }
                  />
                  <Route
                    path="community/friends"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <FriendsListPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="community/conversations"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <ConversationsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="community/chat/:conversationId"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <ChatPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="party/create"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <PartyCreatePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="party/join"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <PartyJoinPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="party/join/:code"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <PartyJoinPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="party/:partyId"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <WatchPartyPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="profile"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <Profile />
                      </Suspense>
                    }
                  />
                  <Route
                    path="profile/:userId"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <UserProfilePage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <SettingsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="leaderboard"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <LeaderboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="achievements"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <AchievementsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="history"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <WatchHistoryPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="my-list"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <MyListPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <NotificationsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="movie/:id"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <MovieDetail />
                      </Suspense>
                    }
                  />
                  <Route
                    path="series/:id"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <SeriesDetail />
                      </Suspense>
                    }
                  />
                  <Route
                    path="series/:id/season/:seasonNum"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <SeasonDetail />
                      </Suspense>
                    }
                  />
                  <Route
                    path="watch/:type/:id"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <WatchPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <Suspense fallback={<SuspenseWrapper />}>
                        <NotFound />
                      </Suspense>
                    }
                  />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: 'var(--tg-bg-color)',
                  color: 'var(--tg-text-color)',
                  border: '1px solid var(--tg-section-bg-color)',
                },
              }}
            />
          </I18nProvider>
        </ThemeProvider>
      </TelegramProvider>
    </QueryClientProvider>
  )
}

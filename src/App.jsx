import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

const Home = lazy(() => import('./pages/Home'))
const Browse = lazy(() => import('./pages/Browse'))
const MovieDetail = lazy(() => import('./pages/MovieDetail'))
const TvDetail = lazy(() => import('./pages/TvDetail'))
const Watch = lazy(() => import('./pages/Watch'))
const Chat = lazy(() => import('./pages/Chat'))
const WatchParty = lazy(() => import('./pages/WatchParty'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Search = lazy(() => import('./pages/Search'))
const Profile = lazy(() => import('./pages/Profile'))

function App() {
  const { i18n } = useTranslation()

  useEffect(() => {
    const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr'
    document.documentElement.dir = dir
    document.documentElement.lang = i18n.language || 'en'
    document.body.classList.toggle('rtl', dir === 'rtl')
  }, [i18n.language])

  useEffect(() => {
    const tg = window?.Telegram?.WebApp
    if (tg) {
      tg.expand()
      tg.disableVerticalSwipes()
      tg.setHeaderColor('#0A0A0A')
      tg.setBackgroundColor('#0A0A0A')
    }
  }, [])

  useEffect(() => {
    import('./lib/telegram').then(({ initTelegram }) => {
      initTelegram().catch(() => {})
    })
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-white max-w-lg mx-auto relative">
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/tv/:id" element={<TvDetail />} />
              <Route path="/watch/:mediaType/:id" element={<Watch />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/party" element={<WatchParty />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
          <Navbar />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App

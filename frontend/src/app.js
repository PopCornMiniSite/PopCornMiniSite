import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Browse, Signin, Signup, MovieDetail, TvDetail, Watch, Chat, WatchParty, Favorites, Search, Profile } from './pages';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dir = i18n.language?.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language || 'en';
    document.body.classList.toggle('rtl', dir === 'rtl');
  }, [i18n.language]);

  useEffect(() => {
    const tg = window?.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.disableVerticalSwipes();
      tg.setHeaderColor('#0A0A0A');
      tg.setBackgroundColor('#0A0A0A');
    }
  }, []);

  useEffect(() => {
    import('./lib/telegram').then(({ initTelegram }) => {
      initTelegram().catch(() => {});
    });
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#fff', maxWidth: '512px', margin: '0 auto', position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/tv/:id" element={<TvDetail />} />
            <Route path="/watch/:mediaType/:id" element={<Watch />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/party" element={<WatchParty />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default function App() {
  return <AppContent />;
}

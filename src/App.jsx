import { useState, useMemo, useEffect } from 'react'
import { useMediaList } from './hooks/useMediaList'
import { useTmdbSearch } from './hooks/useTmdbSearch'
import { useDebounce } from './hooks/useDebounce'
import { useFavorites } from './hooks/useFavorites'
import { getSession, logout } from './utils/auth'
import SearchBar from './components/SearchBar'
import MovieGrid from './components/MovieGrid'
import RecommendSection from './components/RecommendSection'
import MovieModal from './components/MovieModal'
import FavoritesModal from './components/FavoritesModal'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const MOVIE_CATEGORIES = [
  { id: 'popular',     label: '인기',         endpoint: '/movie/popular' },
  { id: 'now_playing', label: '현재 상영 중', endpoint: '/movie/now_playing' },
  { id: 'upcoming',    label: '개봉 예정',     endpoint: '/movie/upcoming' },
  { id: 'top_rated',   label: '높은 평점',     endpoint: '/movie/top_rated' },
]

const TV_CATEGORIES = [
  { id: 'popular',    label: '인기',         endpoint: '/tv/popular' },
  { id: 'on_the_air', label: '현재 방영 중', endpoint: '/tv/on_the_air' },
  { id: 'top_rated',  label: '높은 평점',     endpoint: '/tv/top_rated' },
]

const MAIN_TABS = [
  { id: 'movie', label: '영화' },
  { id: 'tv', label: '드라마' },
]

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('filmo-theme')
    return stored ? stored === 'dark' : true
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    localStorage.setItem('filmo-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const [user, setUser] = useState(null)
  const [authModal, setAuthModal] = useState(null)

  useEffect(() => { getSession().then(setUser) }, [])

  function handleLogin(session) { setUser(session); setAuthModal(null) }
  function handleLogout() { logout(); setUser(null) }

  return (
    <>
      <MainApp
        user={user}
        onLogout={handleLogout}
        onShowLogin={() => setAuthModal('login')}
        onShowSignup={() => setAuthModal('signup')}
        isDark={isDark}
        setIsDark={setIsDark}
      />
      {authModal === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onGoSignup={() => setAuthModal('signup')}
          onClose={() => setAuthModal(null)}
        />
      )}
      {authModal === 'signup' && (
        <SignupPage
          onSignup={handleLogin}
          onGoLogin={() => setAuthModal('login')}
          onClose={() => setAuthModal(null)}
        />
      )}
    </>
  )
}

function MainApp({ user, onLogout, onShowLogin, onShowSignup, isDark, setIsDark }) {
  const [activeTab, setActiveTab] = useState('movie')
  const [movieQuery, setMovieQuery] = useState('')
  const [tvQuery, setTvQuery] = useState('')
  const [movieCategoryId, setMovieCategoryId] = useState('popular')
  const [tvCategoryId, setTvCategoryId] = useState('popular')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedMovieMatchGenres, setSelectedMovieMatchGenres] = useState(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const [loginToast, setLoginToast] = useState(false)

  useEffect(() => {
    if (!loginToast) return
    const t = setTimeout(() => setLoginToast(false), 2500)
    return () => clearTimeout(t)
  }, [loginToast])

  const movieEndpoint = MOVIE_CATEGORIES.find(c => c.id === movieCategoryId)?.endpoint ?? '/movie/popular'
  const tvEndpoint = TV_CATEGORIES.find(c => c.id === tvCategoryId)?.endpoint ?? '/tv/popular'

  const { items: movieList, loading: movieListLoading, error: movieListError, loadMore: movieListLoadMore, hasMore: movieListHasMore, loadingMore: movieListLoadingMore } = useMediaList(movieEndpoint)
  const { items: tvList, loading: tvListLoading, error: tvListError, loadMore: tvListLoadMore, hasMore: tvListHasMore, loadingMore: tvListLoadingMore } = useMediaList(tvEndpoint)

  const debouncedMovieQuery = useDebounce(movieQuery, 350)
  const debouncedTvQuery = useDebounce(tvQuery, 350)

  const { results: movieSearchResults, loading: movieSearchLoading, loadMore: movieSearchLoadMore, hasMore: movieSearchHasMore, loadingMore: movieSearchLoadingMore } = useTmdbSearch(debouncedMovieQuery, 'movie')
  const { results: tvSearchResults, loading: tvSearchLoading, loadMore: tvSearchLoadMore, hasMore: tvSearchHasMore, loadingMore: tvSearchLoadingMore } = useTmdbSearch(debouncedTvQuery, 'tv')

  const displayedMovies = debouncedMovieQuery ? movieSearchResults : movieList
  const displayedMoviesLoading = debouncedMovieQuery ? movieSearchLoading : movieListLoading
  const displayedMoviesError = debouncedMovieQuery ? null : movieListError
  const displayedMoviesLoadMore = debouncedMovieQuery ? movieSearchLoadMore : movieListLoadMore
  const displayedMoviesHasMore = debouncedMovieQuery ? movieSearchHasMore : movieListHasMore
  const displayedMoviesLoadingMore = debouncedMovieQuery ? movieSearchLoadingMore : movieListLoadingMore

  const displayedTv = debouncedTvQuery ? tvSearchResults : tvList
  const displayedTvLoading = debouncedTvQuery ? tvSearchLoading : tvListLoading
  const displayedTvError = debouncedTvQuery ? null : tvListError
  const displayedTvLoadMore = debouncedTvQuery ? tvSearchLoadMore : tvListLoadMore
  const displayedTvHasMore = debouncedTvQuery ? tvSearchHasMore : tvListHasMore
  const displayedTvLoadingMore = debouncedTvQuery ? tvSearchLoadingMore : tvListLoadingMore

  const { favorites, toggle, isFavorite } = useFavorites(user?.email)

  const movieFavorites = useMemo(() => favorites.filter(f => (f._type || 'movie') === 'movie'), [favorites])
  const tvFavorites = useMemo(() => favorites.filter(f => f._type === 'tv'), [favorites])

  const isMovieFavorite = id => isFavorite(id, 'movie')
  const isTvFavorite = id => isFavorite(id, 'tv')

  function requireAuth(action) {
    if (!user) { setLoginToast(true); return }
    action()
  }

  const handleMovieToggle = movie => requireAuth(() => toggle(movie, 'movie'))
  const handleTvToggle = movie => requireAuth(() => toggle(movie, 'tv'))
  const handleCardClick = movie => { setSelectedId(movie.id); setSelectedMovieMatchGenres(null) }
  const handleRecCardClick = (movie, matchingGenreIds) => { setSelectedId(movie.id); setSelectedMovieMatchGenres(matchingGenreIds ?? null) }

  function handleMovieCategoryChange(id) { setMovieCategoryId(id); setMovieQuery('') }
  function handleTvCategoryChange(id) { setTvCategoryId(id); setTvQuery('') }

  return (
    <div className="min-h-screen" style={{ background: 'var(--c-bg)', color: 'var(--c-text)', transition: 'background-color 0.3s ease' }}>
      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--c-header)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--c-border)',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <span className="text-base sm:text-lg font-bold select-none shrink-0"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.18em',
            }}>
            FILMO
          </span>

          <div className="flex items-center p-0.5 sm:p-1 rounded-xl gap-0.5"
            style={{ background: 'var(--c-tab-pool)', transition: 'background-color 0.3s ease' }}>
            {MAIN_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1 text-xs sm:px-7 sm:py-2 sm:text-[15px] rounded-xl font-semibold transition-all duration-200"
                style={activeTab === tab.id
                  ? { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', boxShadow: '0 2px 14px rgba(124,58,237,0.4)' }
                  : { color: 'var(--c-tab-off)', background: 'transparent' }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Favorites button */}
            <button
              onClick={() => user ? setShowFavorites(true) : onShowLogin()}
              className="heart-nav-btn relative flex items-center gap-1 rounded-xl font-medium px-2 py-1.5 sm:px-4 sm:py-2"
              style={{ background: 'var(--c-glass)', color: 'var(--c-text-2)' }}
              aria-label="찜 목록"
            >
              <HeartIcon filled={favorites.length > 0} />
              {favorites.length > 0 && (
                <span className="font-bold text-xs sm:text-[13px]" style={{ color: 'var(--c-count-text)' }}>
                  {favorites.length}
                </span>
              )}
            </button>

            <button onClick={() => setIsDark(d => !d)}
              className="theme-toggle w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--c-glass)', color: 'var(--c-text-2)' }}
              aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}>
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <>
                <span className="hidden sm:block text-xs font-medium px-1" style={{ color: 'var(--c-text-3)' }}>
                  {user.name}
                </span>
                <button onClick={onLogout}
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--c-glass)', color: 'var(--c-text-2)', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.12)'; e.currentTarget.style.color = '#f87171' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-glass)'; e.currentTarget.style.color = 'var(--c-text-2)' }}
                  aria-label="로그아웃">
                  <LogoutIcon />
                </button>
              </>
            ) : (
              <>
                <button onClick={onShowLogin}
                  className="px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'var(--c-glass)', color: 'var(--c-text-2)', border: '1px solid var(--c-border)', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-glass-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-glass)')}>
                  로그인
                </button>
                <button onClick={onShowSignup}
                  className="hidden sm:block px-3.5 py-2 rounded-xl text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', boxShadow: '0 2px 10px rgba(124,58,237,0.35)', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  회원가입
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        {activeTab === 'movie' && (
          <>
            <SearchBar value={movieQuery} onChange={setMovieQuery}
              categories={MOVIE_CATEGORIES} activeCategory={movieCategoryId}
              onCategoryChange={handleMovieCategoryChange} />
            <MovieGrid
              movies={displayedMovies} loading={displayedMoviesLoading} error={displayedMoviesError}
              isFavorite={isMovieFavorite} onToggleFavorite={handleMovieToggle} onCardClick={handleCardClick}
              loadMore={displayedMoviesLoadMore} hasMore={displayedMoviesHasMore} loadingMore={displayedMoviesLoadingMore}
            />
            {movieFavorites.length > 0 && (
              <div className="mt-2" style={{ borderTop: '1px solid var(--c-border)' }}>
                <RecommendSection favorites={movieFavorites} isFavorite={isMovieFavorite}
                  onToggleFavorite={handleMovieToggle} onCardClick={handleRecCardClick}
                  sectionTitle="이런 영화는 어때요?" mediaType="movie" />
              </div>
            )}
          </>
        )}

        {activeTab === 'tv' && (
          <>
            <SearchBar value={tvQuery} onChange={setTvQuery}
              categories={TV_CATEGORIES} activeCategory={tvCategoryId}
              onCategoryChange={handleTvCategoryChange} />
            <MovieGrid
              movies={displayedTv} loading={displayedTvLoading} error={displayedTvError}
              isFavorite={isTvFavorite} onToggleFavorite={handleTvToggle} onCardClick={handleCardClick}
              loadMore={displayedTvLoadMore} hasMore={displayedTvHasMore} loadingMore={displayedTvLoadingMore}
            />
            {tvFavorites.length > 0 && (
              <div className="mt-2" style={{ borderTop: '1px solid var(--c-border)' }}>
                <RecommendSection favorites={tvFavorites} isFavorite={isTvFavorite}
                  onToggleFavorite={handleTvToggle} onCardClick={handleRecCardClick}
                  sectionTitle="이런 드라마는 어때요?" mediaType="tv" />
              </div>
            )}
          </>
        )}
      </main>

      {selectedId && (
        <MovieModal
          movieId={selectedId} mediaType={activeTab}
          onClose={() => { setSelectedId(null); setSelectedMovieMatchGenres(null) }}
          isFavorite={isFavorite}
          onToggleFavorite={activeTab === 'movie' ? handleMovieToggle : handleTvToggle}
          matchingGenreIds={selectedMovieMatchGenres}
        />
      )}

      {showFavorites && (
        <FavoritesModal
          favorites={favorites} isFavorite={isFavorite} onToggleFavorite={toggle}
          onCardClick={movie => { setSelectedId(movie.id); setActiveTab(movie._type || 'movie'); setShowFavorites(false) }}
          onClose={() => setShowFavorites(false)}
        />
      )}

      {/* Login required toast */}
      {loginToast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium fade-in"
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text)',
            boxShadow: 'var(--c-modal-shadow)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth={2} strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          로그인이 필요합니다
          <button onClick={onShowLogin}
            className="ml-1 text-xs font-semibold"
            style={{ color: '#818cf8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}>
            로그인
          </button>
        </div>
      )}
    </div>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
      fill={filled ? '#f87171' : 'none'} stroke={filled ? '#f87171' : 'currentColor'}
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

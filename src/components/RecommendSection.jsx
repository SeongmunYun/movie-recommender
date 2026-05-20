import { useState, useMemo } from 'react'
import MovieCard from './MovieCard'
import BaseSelectorModal from './BaseSelectorModal'
import { useDiscoverByGenres } from '../hooks/useDiscoverByGenres'
import { getPosterUrl } from '../utils/tmdb'

const GENRE_NAMES = {
  28: '액션', 12: '모험', 16: '애니메이션', 35: '코미디', 80: '범죄',
  99: '다큐멘터리', 18: '드라마', 10751: '가족', 14: '판타지', 36: '역사',
  27: '공포', 10402: '음악', 9648: '미스터리', 10749: '로맨스', 878: 'SF',
  53: '스릴러', 10752: '전쟁', 37: '서부', 10759: '액션&모험',
  10762: '어린이', 10763: '뉴스', 10764: '리얼리티', 10765: 'SF&판타지',
  10766: '연속극', 10767: '토크쇼', 10768: '전쟁&정치',
}

export default function RecommendSection({ favorites, isFavorite, onToggleFavorite, onCardClick, sectionTitle, mediaType }) {
  const [baseMovies, setBaseMovies] = useState([])
  const [showSelector, setShowSelector] = useState(false)

  const genreIds = useMemo(() => {
    const ids = new Set()
    baseMovies.forEach(m => (m.genre_ids || []).forEach(id => ids.add(id)))
    return [...ids]
  }, [baseMovies])

  const { movies: discovered, loading, loadMore, hasMore, loadingMore } = useDiscoverByGenres(genreIds, mediaType)

  const baseMovieIds = useMemo(() => new Set(baseMovies.map(m => m.id)), [baseMovies])
  const genreIdSet = useMemo(() => new Set(genreIds), [genreIds])

  const filtered = useMemo(
    () => discovered.filter(m => {
      if (isFavorite(m.id) || baseMovieIds.has(m.id)) return false
      const matchCount = (m.genre_ids || []).filter(id => genreIdSet.has(id)).length
      return matchCount >= 2
    }),
    [discovered, isFavorite, baseMovieIds, genreIdSet]
  )

  function handleCardClick(movie) {
    const baseGenreIds = new Set()
    baseMovies.forEach(m => (m.genre_ids || []).forEach(id => baseGenreIds.add(id)))
    const matchingIds = (movie.genre_ids || []).filter(id => baseGenreIds.has(id))
    onCardClick?.(movie, matchingIds.length > 0 ? matchingIds : null)
  }

  if (favorites.length === 0) return null

  return (
    <section className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title={sectionTitle} />
        <button
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{
            background: 'var(--c-genre-bg)',
            color: 'var(--c-genre-text)',
            border: '1px solid var(--c-genre-border)',
            transition: 'opacity 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          기준 {mediaType === 'tv' ? '드라마' : '영화'} 선택
          {baseMovies.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--c-genre-border)', minWidth: '16px', textAlign: 'center' }}>
              {baseMovies.length}
            </span>
          )}
        </button>
      </div>

      {/* Base movie posters strip */}
      {baseMovies.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--c-text-3)' }}>기준</span>
          <div className="flex items-center gap-1.5">
            {baseMovies.map(m => (
              <div key={m.id} className="rounded-lg overflow-hidden flex-shrink-0"
                style={{ width: '36px', height: '54px', background: 'var(--c-card)', outline: '1.5px solid rgba(124,58,237,0.4)', outlineOffset: '1px' }}
                title={m.title || m.name}
              >
                {getPosterUrl(m.poster_path)
                  ? <img src={getPosterUrl(m.poster_path)} alt={m.title || m.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full" style={{ background: 'var(--c-card)' }} />
                }
              </div>
            ))}
          </div>
          <button onClick={() => setBaseMovies([])} className="text-xs ml-1"
            style={{ color: 'var(--c-text-3)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}>
            초기화
          </button>
        </div>
      )}

      {/* Empty state */}
      {baseMovies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2.5 rounded-2xl"
          style={{ border: '1px dashed var(--c-border)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--c-empty-icon)" strokeWidth={1.5} strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 17.5h7M17.5 14v7" />
          </svg>
          <p className="text-sm" style={{ color: 'var(--c-muted)' }}>기준 영화를 선택하면 추천이 나타납니다</p>
        </div>
      )}

      {/* Results */}
      {baseMovies.length > 0 && (
        loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {filtered.map(movie => (
                <div key={movie.id} className="flex flex-col gap-1.5">
                  <MovieCard
                    movie={movie}
                    isFavorite={isFavorite(movie.id)}
                    onToggleFavorite={onToggleFavorite}
                    onCardClick={handleCardClick}
                  />
                  <AiReasonButton movie={movie} baseMovies={baseMovies} />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    background: loadingMore ? 'var(--c-glass)' : 'var(--c-tab-pool)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text-2)',
                    cursor: loadingMore ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background = 'var(--c-glass-hover)' }}
                  onMouseLeave={e => { if (!loadingMore) e.currentTarget.style.background = 'var(--c-tab-pool)' }}
                >
                  {loadingMore ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: 'var(--c-spinner)', borderTopColor: 'transparent' }} />
                      <span>불러오는 중...</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                      <span>더 보기</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: 'var(--c-muted)' }}>추천 결과가 없습니다</p>
        )
      )}

      {showSelector && (
        <BaseSelectorModal
          favorites={favorites}
          selected={baseMovies}
          onConfirm={setBaseMovies}
          onClose={() => setShowSelector(false)}
          mediaType={mediaType}
        />
      )}
    </section>
  )
}

function AiReasonButton({ movie, baseMovies }) {
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [reason, setReason] = useState(null)

  async function handleClick() {
    if (status === 'done') {
      setStatus('idle')
      setReason(null)
      return
    }
    setStatus('loading')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clova/recommend-reason`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle: movie.title || movie.name,
          movieGenres: (movie.genre_ids || []).map(id => GENRE_NAMES[id] || String(id)),
          likedMovies: baseMovies,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReason(data.reason)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="w-full py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
        style={{
          background: status === 'done' ? 'rgba(124,58,237,0.15)' : 'var(--c-glass)',
          color: status === 'done' ? '#a78bfa' : 'var(--c-text-3)',
          border: `1px solid ${status === 'done' ? 'rgba(124,58,237,0.3)' : 'var(--c-border)'}`,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { if (status !== 'loading') e.currentTarget.style.opacity = '0.8' }}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {status === 'loading' ? (
          <>
            <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin"
              style={{ borderColor: 'var(--c-text-3)', borderTopColor: 'transparent' }} />
            <span>분석 중...</span>
          </>
        ) : (
          <>
            <SparkleIcon />
            <span>{status === 'done' ? '닫기' : 'AI 추천 이유'}</span>
          </>
        )}
      </button>

      {status === 'done' && reason && (
        <div
          className="px-2.5 py-2 rounded-lg text-xs leading-relaxed"
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            color: 'var(--c-text-2)',
          }}
        >
          {reason}
        </div>
      )}

      {status === 'error' && (
        <p className="text-xs text-center" style={{ color: '#f87171' }}>
          추천 이유를 불러오지 못했습니다.
        </p>
      )}
    </div>
  )
}

function SparkleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />
    </svg>
  )
}

function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-1 h-5 rounded-full flex-shrink-0"
        style={{ background: 'linear-gradient(180deg, #60a5fa, #7c3aed)' }} />
      <h2 className="text-sm font-semibold" style={{ color: 'var(--c-section-text)' }}>{title}</h2>
    </div>
  )
}

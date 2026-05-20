import { useEffect } from 'react'
import { useMovieDetail } from '../hooks/useMovieDetail'
import { getPosterUrl } from '../utils/tmdb'

function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

export default function MovieModal({ movieId, mediaType = 'movie', onClose, isFavorite, onToggleFavorite, matchingGenreIds }) {
  const { detail, loading } = useMovieDetail(movieId, mediaType)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const title = detail?.title || detail?.name
  const date = detail?.release_date || detail?.first_air_date
  const runtime = detail?.runtime || detail?.episode_run_time?.[0]
  const year = date ? date.slice(0, 4) : null
  const liked = isFavorite?.(movieId, mediaType) ?? false

  // Genres that match the user's base movie selection
  const matchingGenres = (detail?.genres || []).filter(g => matchingGenreIds?.includes(g.id))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl fade-in"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-modal-shadow)',
          transition: 'background-color 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'var(--c-close-bg)', color: 'var(--c-close-text)', transition: 'background 0.2s, color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-glass-hover)'; e.currentTarget.style.color = 'var(--c-text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-close-bg)'; e.currentTarget.style.color = 'var(--c-close-text)' }}
          aria-label="닫기"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {loading && (
          <div className="flex justify-center items-center py-28">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--c-spinner)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && detail && (
          <div className="flex flex-col sm:flex-row" style={{ minHeight: '280px' }}>
            {/* Poster: mobile */}
            {detail.poster_path && (
              <div className="sm:hidden w-full" style={{ maxHeight: '260px', overflow: 'hidden' }}>
                <img src={getPosterUrl(detail.poster_path)} alt={title}
                  className="w-full object-cover object-top"
                  style={{ maxHeight: '260px', borderRadius: '1rem 1rem 0 0' }} />
              </div>
            )}

            {/* Poster: desktop */}
            {detail.poster_path && (
              <div className="hidden sm:block flex-shrink-0"
                style={{ width: '176px', alignSelf: 'stretch', background: 'var(--c-card)', borderRadius: '1rem 0 0 1rem', overflow: 'hidden' }}>
                <img src={getPosterUrl(detail.poster_path)} alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block' }} />
              </div>
            )}

            {/* Content */}
            <div className="p-6 flex flex-col gap-4 flex-1 min-w-0">

              {/* Recommendation context banner */}
              {matchingGenres.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: 'var(--c-genre-bg)', border: '1px solid var(--c-genre-border)', marginTop: '4px', marginRight: '36px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--c-genre-text)">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  <span style={{ color: 'var(--c-genre-text)' }}>
                    기준 영화와 유사한 장르:{' '}
                    <strong>{matchingGenres.map(g => g.name).join(', ')}</strong>
                  </span>
                </div>
              )}

              {/* Title row */}
              <div className="flex items-start gap-3 pr-8">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold leading-snug" style={{ color: 'var(--c-text)', fontSize: '18px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{title}</h2>
                  {year && <span className="text-xs mt-1 inline-block" style={{ color: 'var(--c-text-3)' }}>{year}</span>}
                  {detail.tagline && (
                    <p className="text-sm mt-1.5 italic leading-snug" style={{ color: 'var(--c-genre-text)' }}>
                      "{detail.tagline}"
                    </p>
                  )}
                </div>

                {/* Heart button */}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(detail)}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: liked ? 'rgba(248,113,113,0.15)' : 'var(--c-glass)',
                      border: `1px solid ${liked ? 'rgba(248,113,113,0.42)' : 'var(--c-border)'}`,
                      transition: 'background 0.2s, border-color 0.2s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    aria-label={liked ? '찜 해제' : '찜하기'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24"
                      fill={liked ? '#f87171' : 'none'}
                      stroke={liked ? '#f87171' : 'var(--c-text-2)'}
                      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Genres */}
              {detail.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.genres.map(g => (
                    <span key={g.id} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: 'var(--c-genre-bg)', color: 'var(--c-genre-text)', border: '1px solid var(--c-genre-border)' }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="font-semibold" style={{ color: '#fbbf24' }}>{detail.vote_average.toFixed(1)}</span>
                </div>
                {date && <span style={{ color: 'var(--c-text-3)' }}>{date.replace(/-/g, '. ')}</span>}
                {formatRuntime(runtime) && (
                  <span style={{ color: 'var(--c-text-3)' }}>
                    {mediaType === 'tv' ? `회당 ${formatRuntime(runtime)}` : formatRuntime(runtime)}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed" style={{ color: 'var(--c-text-2)' }}>
                {detail.overview || '줄거리 정보가 없습니다.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

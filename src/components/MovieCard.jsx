import { useEffect } from 'react'
import { getPosterUrl } from '../utils/tmdb'

export default function MovieCard({ movie, isFavorite, onToggleFavorite, onImpression, onCardClick, badge }) {
  const posterUrl = getPosterUrl(movie.poster_path)

  useEffect(() => {
    onImpression?.()
  }, [onImpression])

  return (
    <div
      onClick={() => onCardClick?.(movie)}
      className="group relative rounded-xl overflow-hidden cursor-pointer fade-in"
      style={{
        aspectRatio: '2/3',
        background: 'var(--c-card)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover"
          style={{ transition: 'transform 0.4s ease' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-empty-icon)" strokeWidth={1.5}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span style={{ color: 'var(--c-muted)', fontSize: '11px' }}>이미지 없음</span>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '55%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)',
        }}
      />

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-2.5 pointer-events-none">
        <p className="text-white text-xs font-semibold leading-snug" style={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {movie.title || movie.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <StarIcon />
          <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
            {movie.vote_average.toFixed(1)}
          </span>
          {badge && (
            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium leading-none ${badge.colorClass}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {/* Favorite button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleFavorite(movie) }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: isFavorite ? 'rgba(248,113,113,0.2)' : 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: isFavorite ? '1px solid rgba(248,113,113,0.45)' : '1px solid rgba(255,255,255,0.14)',
          transition: 'background 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label={isFavorite ? '찜 해제' : '찜하기'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24"
          fill={isFavorite ? '#f87171' : 'none'}
          stroke={isFavorite ? '#f87171' : 'rgba(255,255,255,0.8)'}
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  )
}

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#fbbf24">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

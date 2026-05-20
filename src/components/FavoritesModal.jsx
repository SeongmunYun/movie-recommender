import { useState } from 'react'
import MovieCard from './MovieCard'

const FILTER_TABS = [
  { id: 'all', label: '전체' },
  { id: 'movie', label: '영화' },
  { id: 'tv', label: '드라마' },
]

export default function FavoritesModal({ favorites, isFavorite, onToggleFavorite, onCardClick, onClose }) {
  const [filter, setFilter] = useState('all')

  const displayed = filter === 'all'
    ? favorites
    : favorites.filter(f => (f._type || 'movie') === filter)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl fade-in"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-modal-shadow)',
          transition: 'background-color 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)' }}>
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#f87171" stroke="#f87171" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>찜 목록</h2>
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
              style={{ background: 'var(--c-count-bg)', color: 'var(--c-count-text)' }}>
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--c-close-bg)', color: 'var(--c-close-text)', transition: 'background 0.2s ease, color 0.2s ease' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--c-glass-hover)'
              e.currentTarget.style.color = 'var(--c-text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--c-close-bg)'
              e.currentTarget.style.color = 'var(--c-close-text)'
            }}
            aria-label="닫기"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)' }}>
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200"
              style={
                filter === tab.id
                  ? { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff' }
                  : { background: 'var(--c-filter-off)', color: 'var(--c-filter-off-text)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--c-empty-icon)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--c-muted)' }}>찜한 항목이 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {displayed.map(movie => (
                <MovieCard
                  key={`${movie._type}-${movie.id}`}
                  movie={movie}
                  isFavorite={isFavorite(movie.id, movie._type || 'movie')}
                  onToggleFavorite={m => onToggleFavorite(m, movie._type || 'movie')}
                  onCardClick={onCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

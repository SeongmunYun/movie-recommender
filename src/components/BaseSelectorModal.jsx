import { useState } from 'react'
import { getPosterUrl } from '../utils/tmdb'

export default function BaseSelectorModal({ favorites, selected: initial, onConfirm, onClose, mediaType }) {
  const [selected, setSelected] = useState(initial)

  function toggle(movie) {
    setSelected(prev => {
      if (prev.some(m => m.id === movie.id)) return prev.filter(m => m.id !== movie.id)
      if (prev.length >= 3) return prev
      return [...prev, movie]
    })
  }

  function confirm() {
    onConfirm(selected)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl fade-in"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--c-modal-shadow)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>기준 {mediaType === 'tv' ? '드라마' : '영화'} 선택</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>찜 목록에서 최대 3개 선택</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{ background: 'var(--c-genre-bg)', color: 'var(--c-genre-text)' }}
            >
              {selected.length} / 3
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--c-close-bg)', color: 'var(--c-close-text)', transition: 'background 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-glass-hover)'; e.currentTarget.style.color = 'var(--c-text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-close-bg)'; e.currentTarget.style.color = 'var(--c-close-text)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4 flex-1">
          {favorites.length === 0 ? (
            <p className="text-center py-14 text-sm" style={{ color: 'var(--c-muted)' }}>찜한 항목이 없습니다</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {favorites.map(movie => {
                const isSelected = selected.some(m => m.id === movie.id)
                const isDisabled = !isSelected && selected.length >= 3
                const posterUrl = getPosterUrl(movie.poster_path)

                return (
                  <button
                    key={movie.id}
                    onClick={() => !isDisabled && toggle(movie)}
                    className="relative rounded-xl overflow-hidden text-left"
                    style={{
                      aspectRatio: '2/3',
                      background: 'var(--c-card)',
                      opacity: isDisabled ? 0.35 : 1,
                      outline: isSelected ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                      outlineOffset: '2px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'opacity 0.2s, outline-color 0.2s, transform 0.15s ease',
                    }}
                    onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.transform = 'scale(1.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                  >
                    {posterUrl ? (
                      <img src={posterUrl} alt={movie.title || movie.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ background: 'var(--c-card)' }} />
                    )}

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ background: 'rgba(124,58,237,0.38)' }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: '#7c3aed', boxShadow: '0 2px 8px rgba(124,58,237,0.6)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Title bar */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88), transparent)' }}>
                      <p className="text-white text-xs font-medium leading-tight truncate">
                        {movie.title || movie.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0"
          style={{ borderTop: '1px solid var(--c-border)' }}>
          <button
            onClick={() => setSelected([])}
            className="text-xs font-medium transition-colors"
            style={{ color: 'var(--c-text-3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-2)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
          >
            초기화
          </button>
          <button
            onClick={confirm}
            disabled={selected.length === 0}
            className="px-5 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: selected.length > 0 ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'var(--c-glass)',
              color: selected.length > 0 ? '#fff' : 'var(--c-text-3)',
              cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: selected.length > 0 ? '0 2px 12px rgba(124,58,237,0.35)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            선택 완료 ({selected.length})
          </button>
        </div>
      </div>
    </div>
  )
}

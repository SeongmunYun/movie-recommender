import MovieCard from './MovieCard'

function SkeletonCard() {
  return <div className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />
}

export default function MovieGrid({ movies, loading, error, isFavorite, onToggleFavorite, onCardClick, loadMore, hasMore, loadingMore }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
        {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--c-err-icon)" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-sm font-semibold" style={{ color: '#f87171' }}>오류가 발생했습니다</p>
        <p className="text-xs" style={{ color: 'var(--c-muted)' }}>{error}</p>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--c-empty-icon)" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-sm" style={{ color: 'var(--c-muted)' }}>결과가 없습니다</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4">
        {movies.map(movie => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isFavorite={isFavorite(movie.id)}
            onToggleFavorite={onToggleFavorite}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {/* 더 보기 */}
      {hasMore && (
        <div className="flex justify-center pb-6 pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: loadingMore ? 'var(--c-glass)' : 'var(--c-tab-pool)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-text-2)',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
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
    </div>
  )
}

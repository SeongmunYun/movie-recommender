import CategoryDropdown from './CategoryDropdown'

export default function SearchBar({ value, onChange, categories, activeCategory, onCategoryChange }) {
  return (
    <div
      className="sticky top-16 z-30 px-4 pt-4 pb-3"
      style={{
        background: 'var(--c-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--c-border)',
        transition: 'background-color 0.3s ease',
      }}
    >
    <div className="max-w-2xl mx-auto w-full">
      <div className="flex gap-2">
        <CategoryDropdown
          categories={categories}
          value={activeCategory}
          onChange={onCategoryChange}
        />

        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--c-text-3)' }}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="제목, 줄거리로 검색..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: 'var(--c-input)',
              border: '1px solid var(--c-input-border)',
              color: 'var(--c-text)',
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--c-input-focus)'
              e.target.style.background = 'var(--c-glass-hover)'
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--c-input-border)'
              e.target.style.background = 'var(--c-input)'
            }}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ color: 'var(--c-search-x)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

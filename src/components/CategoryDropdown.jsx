import { useState, useRef, useEffect } from 'react'

export default function CategoryDropdown({ categories, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = categories.find(c => c.id === value)

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap h-full"
        style={{
          background: 'var(--c-glass)',
          border: '1px solid var(--c-border)',
          color: 'var(--c-text-2)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-glass-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-glass)')}
      >
        <span>{current?.label}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 rounded-xl overflow-hidden z-50 fade-in"
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
            minWidth: '100%',
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { onChange(cat.id); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm whitespace-nowrap block"
              style={{
                color: cat.id === value ? 'var(--c-genre-text)' : 'var(--c-text-2)',
                background: cat.id === value ? 'var(--c-genre-bg)' : 'transparent',
                fontWeight: cat.id === value ? '600' : '400',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { if (cat.id !== value) e.currentTarget.style.background = 'var(--c-glass)' }}
              onMouseLeave={e => { if (cat.id !== value) e.currentTarget.style.background = 'transparent' }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

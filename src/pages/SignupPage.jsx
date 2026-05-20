import { useState } from 'react'
import { signup, login } from '../utils/auth'

export default function SignupPage({ onSignup, onGoLogin, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('모든 항목을 입력해주세요.'); return
    }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    setLoading(true)
    try {
      await signup({ name: name.trim(), email: email.trim(), password })
      const session = await login({ email: email.trim(), password })
      onSignup(session)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--c-overlay)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-sm fade-in" onClick={e => e.stopPropagation()}>
        {/* Logo */}
        <div className="mb-6 text-center">
          <span className="text-3xl font-bold select-none"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.18em',
            }}>
            COTTD
          </span>
          <p className="mt-2 text-sm" style={{ color: 'var(--c-text-3)' }}>취향 맞춤 영화·드라마 추천</p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-7"
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            boxShadow: 'var(--c-modal-shadow)',
          }}>

          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--c-close-bg)', color: 'var(--c-close-text)', transition: 'background 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--c-glass-hover)'; e.currentTarget.style.color = 'var(--c-text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--c-close-bg)'; e.currentTarget.style.color = 'var(--c-close-text)' }}
              aria-label="닫기"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <h1 className="text-lg font-bold mb-6 pr-8" style={{ color: 'var(--c-text)' }}>회원가입</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput label="이름" type="text" value={name} onChange={setName}
              placeholder="홍길동" autoComplete="name" />
            <AuthInput label="이메일" type="email" value={email} onChange={setEmail}
              placeholder="example@email.com" autoComplete="email" />
            <AuthInput label="비밀번호" type="password" value={password} onChange={setPassword}
              placeholder="6자 이상" autoComplete="new-password" />
            <AuthInput label="비밀번호 확인" type="password" value={confirm} onChange={setConfirm}
              placeholder="비밀번호 재입력" autoComplete="new-password" />

            {error && <p className="text-xs px-1" style={{ color: '#f87171' }}>{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-sm font-semibold mt-1"
              style={{
                background: loading ? 'var(--c-glass)' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: loading ? 'var(--c-text-3)' : '#fff',
                boxShadow: loading ? 'none' : '0 2px 14px rgba(124,58,237,0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}>
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--c-text-3)' }}>
            이미 계정이 있으신가요?{' '}
            <button onClick={onGoLogin} className="font-semibold"
              style={{ color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#818cf8')}>
              로그인
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function AuthInput({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: 'var(--c-text-2)' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
        style={{
          background: 'var(--c-input)', border: '1px solid var(--c-input-border)',
          color: 'var(--c-text)', transition: 'border-color 0.2s ease, background-color 0.2s ease',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--c-input-focus)'; e.target.style.background = 'var(--c-glass-hover)' }}
        onBlur={e => { e.target.style.borderColor = 'var(--c-input-border)'; e.target.style.background = 'var(--c-input)' }}
      />
    </div>
  )
}

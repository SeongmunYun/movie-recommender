import { useState, useEffect, Fragment } from 'react'

const API_BASE = 'http://101.79.23.212:3000'
const ADMIN_KEY = 'admin1234'
const SESSION_KEY = 'filmo-admin-auth'

async function adminFetch(path, options = {}) {
  const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}password=${ADMIN_KEY}`
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || '요청 실패')
  return data
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [users, setUsers] = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [likes, setLikes] = useState({})
  const [likesLoading, setLikesLoading] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authed) loadUsers()
  }, [authed])

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const data = await adminFetch('/api/admin/users')
      const arr = Array.isArray(data) ? data : (data?.users ?? [])
      setUsers(arr)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_KEY) {
      sessionStorage.setItem(SESSION_KEY, '1')
      setAuthed(true)
      setPwError('')
    } else {
      setPwError('비밀번호가 올바르지 않습니다.')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setUsers([])
    setLikes({})
    setExpandedId(null)
  }

  async function toggleLikes(userId) {
    if (expandedId === userId) {
      setExpandedId(null)
      return
    }
    setExpandedId(userId)
    if (likes[userId] !== undefined) return
    setLikesLoading(prev => ({ ...prev, [userId]: true }))
    try {
      const data = await adminFetch(`/api/admin/users/${userId}/likes`)
      const arr = Array.isArray(data) ? data : (data?.likes ?? [])
      setLikes(prev => ({ ...prev, [userId]: arr }))
    } catch {
      setLikes(prev => ({ ...prev, [userId]: [] }))
    } finally {
      setLikesLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  async function handleDelete(user) {
    const name = user.username || user.name
    if (!window.confirm(`"${name}" (${user.email}) 계정을 삭제하시겠습니까?\n찜 목록도 모두 삭제됩니다.`)) return
    try {
      await adminFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setLikes(prev => { const next = { ...prev }; delete next[user.id]; return next })
      if (expandedId === user.id) setExpandedId(null)
    } catch (e) {
      alert(e.message)
    }
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ width: '100%', maxWidth: '360px', background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem' }}>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>관리자 로그인</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>FILMO 관리자 페이지</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="관리자 비밀번호"
              autoFocus
              style={{
                width: '100%', padding: '0.625rem 1rem', borderRadius: '0.75rem',
                background: '#0f172a', border: '1px solid #334155', color: '#f1f5f9',
                fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {pwError && <p style={{ color: '#f87171', fontSize: '0.75rem' }}>{pwError}</p>}
            <button
              type="submit"
              style={{
                width: '100%', padding: '0.625rem', borderRadius: '0.75rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', padding: '1.5rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>관리자 페이지</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>가입자 수: {users.length}명</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem', borderRadius: '0.75rem',
              background: '#1e293b', border: '1px solid #334155',
              color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            로그아웃
          </button>
        </div>

        {/* Error */}
        {error && (
          <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem' }}>오류: {error}</p>
        )}

        {/* Table */}
        {loading ? (
          <p style={{ color: '#64748b' }}>불러오는 중...</p>
        ) : (
          <div style={{ border: '1px solid #334155', borderRadius: '1rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
                  {['이름', '이메일', '가입일', '찜 목록', '관리'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#475569' }}>
                      가입자가 없습니다.
                    </td>
                  </tr>
                )}
                {users.map((user, i) => (
                  <Fragment key={user.id}>
                    <tr
                      style={{
                        background: i % 2 === 0 ? '#0f172a' : '#111827',
                        borderBottom: expandedId === user.id ? 'none' : '1px solid #1e293b',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>{user.username || user.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{user.email}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => toggleLikes(user.id)}
                          style={{
                            padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                            background: expandedId === user.id ? 'rgba(37,99,235,0.15)' : '#1e293b',
                            color: expandedId === user.id ? '#60a5fa' : '#94a3b8',
                            border: `1px solid ${expandedId === user.id ? '#2563eb' : '#334155'}`,
                            fontSize: '0.75rem', cursor: 'pointer',
                          }}
                        >
                          {expandedId === user.id ? '접기 ▲' : '보기 ▼'}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => handleDelete(user)}
                          style={{
                            padding: '0.25rem 0.75rem', borderRadius: '0.5rem',
                            background: 'rgba(127,29,29,0.2)', color: '#f87171',
                            border: '1px solid rgba(127,29,29,0.6)',
                            fontSize: '0.75rem', cursor: 'pointer',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(127,29,29,0.35)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(127,29,29,0.2)')}
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                    {expandedId === user.id && (
                      <tr
                        style={{
                          background: i % 2 === 0 ? '#0f172a' : '#111827',
                          borderBottom: '1px solid #1e293b',
                        }}
                      >
                        <td colSpan={5} style={{ padding: '0.25rem 1.5rem 1rem' }}>
                          {likesLoading[user.id] ? (
                            <p style={{ color: '#475569', fontSize: '0.75rem' }}>불러오는 중...</p>
                          ) : (likes[user.id] || []).length === 0 ? (
                            <p style={{ color: '#475569', fontSize: '0.75rem' }}>찜한 항목이 없습니다.</p>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {(likes[user.id] || []).map(item => (
                                <span
                                  key={`${item.id}-${item._type}`}
                                  style={{
                                    padding: '0.25rem 0.625rem', borderRadius: '0.5rem',
                                    background: '#1e293b', border: '1px solid #334155',
                                    color: '#cbd5e1', fontSize: '0.75rem',
                                  }}
                                >
                                  {item._type === 'tv' ? '📺' : '🎬'} {item.title || item.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const TOKEN_KEY = 'filmo-token'
const API_BASE = import.meta.env.VITE_API_URL

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || '요청에 실패했습니다.')
  return data
}

function normalizeUser(data) {
  const u = data.user ?? data
  return { id: u.id, name: u.username ?? u.name, email: u.email }
}

export async function signup({ name, email, password }) {
  await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: name, email, password }),
  })
}

export async function login({ email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const token = data.token ?? data.accessToken
  localStorage.setItem(TOKEN_KEY, token)
  return normalizeUser(data)
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function getSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try {
    const data = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return normalizeUser(data)
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
}

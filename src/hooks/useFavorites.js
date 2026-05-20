import { useState, useEffect } from 'react'

const TOKEN_KEY = 'filmo-token'
const GUEST_KEY = 'favorites'
const API_BASE = import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json().catch(() => null)
}

function normalizeLikes(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.likes)) return data.likes
  if (Array.isArray(data?.data)) return data.data
  return []
}

export function useFavorites(userId) {
  const isLoggedIn = !!userId
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    if (!isLoggedIn) {
      const stored = localStorage.getItem(GUEST_KEY)
      setFavorites(stored ? JSON.parse(stored) : [])
      return
    }
    apiFetch('/api/likes')
      .then(data => setFavorites(normalizeLikes(data)))
      .catch(() => setFavorites([]))
  }, [isLoggedIn, userId])

  function toggle(movie, type) {
    const item = { ...movie, _type: type }
    const exists = favorites.some(m => m.id === movie.id && (m._type || 'movie') === type)

    if (!isLoggedIn) {
      setFavorites(prev => {
        const next = exists
          ? prev.filter(m => !(m.id === movie.id && (m._type || 'movie') === type))
          : [...prev, item]
        localStorage.setItem(GUEST_KEY, JSON.stringify(next))
        return next
      })
      return
    }

    // Optimistic update
    setFavorites(prev =>
      exists
        ? prev.filter(m => !(m.id === movie.id && (m._type || 'movie') === type))
        : [...prev, item]
    )

    const apiCall = exists
      ? apiFetch(`/api/likes/${movie.id}`, { method: 'DELETE' })
      : apiFetch('/api/likes', { method: 'POST', body: JSON.stringify({ movie: item }) })

    apiCall.catch(() => {
      // Revert on failure
      setFavorites(prev =>
        exists
          ? [...prev, item]
          : prev.filter(m => !(m.id === movie.id && (m._type || 'movie') === type))
      )
    })
  }

  function isFavorite(id, type) {
    return favorites.some(m => m.id === id && (m._type || 'movie') === type)
  }

  return { favorites, toggle, isFavorite }
}

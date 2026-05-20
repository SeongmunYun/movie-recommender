import { useState, useCallback } from 'react'

const KEY = 'rec_stats'
const DEFAULT = { impressions: 0, clicks: 0, favorites: 0 }

function load() {
  return JSON.parse(localStorage.getItem(KEY) || JSON.stringify(DEFAULT))
}

function save(stats) {
  localStorage.setItem(KEY, JSON.stringify(stats))
}

export function useRecStats() {
  const [stats, setStats] = useState(load)

  const increment = useCallback((field) => {
    setStats(prev => {
      const next = { ...prev, [field]: prev[field] + 1 }
      save(next)
      return next
    })
  }, [])

  const trackImpression = useCallback(() => increment('impressions'), [increment])
  const trackClick = useCallback(() => increment('clicks'), [increment])
  const trackFavorite = useCallback(() => increment('favorites'), [increment])

  const ctr = stats.impressions > 0
    ? ((stats.clicks / stats.impressions) * 100).toFixed(1)
    : null

  const favoriteRate = stats.clicks > 0
    ? ((stats.favorites / stats.clicks) * 100).toFixed(1)
    : '0.0'

  return { stats, ctr, favoriteRate, trackImpression, trackClick, trackFavorite }
}

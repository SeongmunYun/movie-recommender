import { useState, useEffect } from 'react'
import { fetchPopularTv } from '../utils/tmdb'

export function usePopularTv() {
  const [tvShows, setTvShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPopularTv()
        if (!cancelled) setTvShows(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { tvShows, loading, error }
}

import { useState, useEffect } from 'react'
import { fetchMovieDetail, fetchTvDetail } from '../utils/tmdb'

export function useMovieDetail(id, mediaType = 'movie') {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setDetail(null)
      return
    }

    let cancelled = false
    const fetchFn = mediaType === 'tv' ? fetchTvDetail : fetchMovieDetail

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchFn(id)
        if (!cancelled) setDetail(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id, mediaType])

  return { detail, loading, error }
}

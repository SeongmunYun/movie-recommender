import { useState, useEffect } from 'react'
import { fetchByGenre, fetchDiscoverTv } from '../utils/tmdb'

export function useRecommendations(genreId, mediaType = 'movie') {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!genreId) {
      setMovies([])
      return
    }

    let cancelled = false
    const fetchFn = mediaType === 'tv' ? fetchDiscoverTv : fetchByGenre

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchFn(genreId)
        if (!cancelled) setMovies(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [genreId, mediaType])

  return { movies, loading, error }
}

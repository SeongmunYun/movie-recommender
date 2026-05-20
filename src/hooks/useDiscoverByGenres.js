import { useState, useEffect } from 'react'
import { fetchDiscoverByGenres } from '../utils/tmdb'

export function useDiscoverByGenres(genreIds, mediaType) {
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const key = genreIds.join(',')

  useEffect(() => {
    setMovies([])
    setPage(1)
    setTotalPages(1)
    setLoading(genreIds.length > 0)
    setLoadingMore(false)
  }, [key, mediaType])

  useEffect(() => {
    if (!genreIds.length) return
    let cancelled = false
    fetchDiscoverByGenres(genreIds, mediaType, page)
      .then(({ results, total_pages }) => {
        if (!cancelled) {
          setMovies(prev => page === 1 ? results : [...prev, ...results])
          setTotalPages(total_pages ?? 1)
          setLoading(false)
          setLoadingMore(false)
        }
      })
      .catch(() => { if (!cancelled) { setMovies([]); setLoading(false); setLoadingMore(false) } })
    return () => { cancelled = true }
  }, [key, mediaType, page])

  function loadMore() {
    if (page < totalPages && !loadingMore && !loading) {
      setLoadingMore(true)
      setPage(p => p + 1)
    }
  }

  return { movies, loading, loadMore, hasMore: page < totalPages, loadingMore }
}

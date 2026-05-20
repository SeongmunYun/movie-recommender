import { useState, useEffect } from 'react'
import { searchMedia } from '../utils/tmdb'

export function useTmdbSearch(query, mediaType) {
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Reset when query/type changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setPage(1)
      setTotalPages(1)
      setLoading(false)
      setLoadingMore(false)
      return
    }
    setResults([])
    setPage(1)
    setTotalPages(1)
    setLoading(true)
    setLoadingMore(false)
  }, [query, mediaType])

  useEffect(() => {
    if (!query.trim()) return
    let cancelled = false
    searchMedia(query, mediaType, page)
      .then(({ results: data, total_pages }) => {
        if (!cancelled) {
          setResults(prev => page === 1 ? data : [...prev, ...data])
          setTotalPages(total_pages ?? 1)
          setLoading(false)
          setLoadingMore(false)
        }
      })
      .catch(() => {
        if (!cancelled) { setResults([]); setLoading(false); setLoadingMore(false) }
      })
    return () => { cancelled = true }
  }, [query, mediaType, page])

  function loadMore() {
    if (page < totalPages && !loadingMore && !loading) {
      setLoadingMore(true)
      setPage(p => p + 1)
    }
  }

  return { results, loading, loadMore, hasMore: page < totalPages, loadingMore }
}

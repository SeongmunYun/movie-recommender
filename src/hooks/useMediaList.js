import { useState, useEffect } from 'react'
import { fetchMediaList } from '../utils/tmdb'

export function useMediaList(endpoint) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  // Reset when endpoint changes
  useEffect(() => {
    setItems([])
    setPage(1)
    setTotalPages(1)
    setLoading(true)
    setError(null)
  }, [endpoint])

  useEffect(() => {
    let cancelled = false
    fetchMediaList(endpoint, page)
      .then(({ results, total_pages }) => {
        if (!cancelled) {
          setItems(prev => page === 1 ? results : [...prev, ...results])
          setTotalPages(total_pages ?? 1)
          setLoading(false)
          setLoadingMore(false)
        }
      })
      .catch(err => {
        if (!cancelled) { setError(err.message); setLoading(false); setLoadingMore(false) }
      })
    return () => { cancelled = true }
  }, [endpoint, page])

  function loadMore() {
    if (page < totalPages && !loadingMore && !loading) {
      setLoadingMore(true)
      setPage(p => p + 1)
    }
  }

  return { items, loading, error, loadMore, hasMore: page < totalPages, loadingMore }
}

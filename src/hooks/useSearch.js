import { useMemo } from 'react'
import Fuse from 'fuse.js'

const FUSE_OPTIONS = {
  keys: ['title', 'name', 'overview'],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export function useSearch(movies, query) {
  const fuse = useMemo(() => new Fuse(movies, FUSE_OPTIONS), [movies])

  return useMemo(() => {
    if (!query.trim()) return movies
    return fuse.search(query).map(result => result.item)
  }, [fuse, query, movies])
}

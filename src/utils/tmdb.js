const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

function getHeaders() {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?language=ko-KR`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return data.results
}

export async function fetchPopularTv() {
  const res = await fetch(`${BASE_URL}/tv/popular?language=ko-KR`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return data.results
}

export async function fetchByGenre(genreId) {
  const res = await fetch(
    `${BASE_URL}/discover/movie?with_genres=${genreId}&language=ko-KR`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return data.results
}

export async function fetchDiscoverTv(genreId) {
  const res = await fetch(
    `${BASE_URL}/discover/tv?with_genres=${genreId}&language=ko-KR`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return data.results
}

export async function fetchTvDetail(tvId) {
  const res = await fetch(`${BASE_URL}/tv/${tvId}?language=ko-KR`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export async function fetchMovieDetail(movieId) {
  const res = await fetch(`${BASE_URL}/movie/${movieId}?language=ko-KR`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  return res.json()
}

export async function fetchMediaList(endpoint, page = 1) {
  const sep = endpoint.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE_URL}${endpoint}${sep}language=ko-KR&page=${page}`, { headers: getHeaders() })
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return { results: data.results, total_pages: data.total_pages }
}

export async function searchMedia(query, mediaType, page = 1) {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  const res = await fetch(
    `${BASE_URL}/search/${type}?query=${encodeURIComponent(query)}&language=ko-KR&page=${page}`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return { results: data.results, total_pages: data.total_pages }
}

export async function fetchDiscoverByGenres(genreIds, mediaType = 'movie', page = 1) {
  const type = mediaType === 'tv' ? 'tv' : 'movie'
  const param = genreIds.join('|')
  const res = await fetch(
    `${BASE_URL}/discover/${type}?with_genres=${param}&language=ko-KR&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`)
  const data = await res.json()
  return { results: data.results, total_pages: data.total_pages }
}

export function getPosterUrl(posterPath) {
  if (!posterPath) return null
  return `${IMAGE_BASE_URL}${posterPath}`
}

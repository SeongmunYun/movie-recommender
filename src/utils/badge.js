export function getBadge(movie, topGenreId) {
  if (topGenreId && movie.genre_ids?.includes(topGenreId)) {
    return { label: '선호 장르 일치', colorClass: 'bg-blue-600 text-white' }
  }
  if (movie.vote_average >= 8.0) {
    return { label: `평점 ${movie.vote_average.toFixed(1)}`, colorClass: 'bg-yellow-500 text-black' }
  }
  if (movie.popularity > 100) {
    return { label: '지금 인기 급상승', colorClass: 'bg-red-600 text-white' }
  }
  return { label: '취향 기반 추천', colorClass: 'bg-gray-600 text-gray-200' }
}

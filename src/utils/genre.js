export function getTopGenreId(favorites) {
  if (!favorites.length) return null

  const counts = {}
  for (const movie of favorites) {
    for (const id of movie.genre_ids ?? []) {
      counts[id] = (counts[id] ?? 0) + 1
    }
  }

  const entries = Object.entries(counts)
  if (!entries.length) return null

  return Number(entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0])
}

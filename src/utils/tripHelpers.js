import { TRIP_DATE_STATUS } from '@/utils/constants'
import { getTripImagePublicUrl } from '@/services/storage'

export function sortTripImages(images = []) {
  return [...images].sort((a, b) => a.display_order - b.display_order)
}

export function getCoverImage(trip) {
  const images = sortTripImages(trip?.trip_images ?? [])
  return images.find((img) => img.is_cover) ?? images[0] ?? null
}

export function getCoverImageUrl(trip) {
  const cover = getCoverImage(trip)
  return cover ? getTripImagePublicUrl(cover.storage_path) : null
}

export function getOpenTripDates(trip) {
  return [...(trip?.trip_dates ?? [])]
    .filter((d) => d.status === TRIP_DATE_STATUS.OPEN)
    .sort(
      (a, b) =>
        new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime(),
    )
}

export function tripMatchesSearch(trip, query) {
  if (!query?.trim()) return true
  const q = query.trim().toLowerCase()
  const haystack = [
    trip.title,
    trip.destination,
    trip.description,
    trip.starting_location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

export function tripMatchesDuration(trip, durationFilter) {
  if (!durationFilter || durationFilter === 'all') return true
  const days = trip.duration_days
  if (durationFilter === 'short') return days <= 4
  if (durationFilter === 'medium') return days >= 5 && days <= 6
  if (durationFilter === 'long') return days >= 7
  return true
}

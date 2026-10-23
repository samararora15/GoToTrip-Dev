import { useEffect, useMemo, useState } from 'react'
import { fetchPublishedTrips, fetchTripBySlug } from '@/services/supabase'
import { tripMatchesDuration, tripMatchesSearch } from '@/utils/tripHelpers'

export function usePublishedTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPublishedTrips().then(({ data, error: fetchError }) => {
      if (cancelled) return
      setTrips(data ?? [])
      setError(fetchError)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { trips, loading, error }
}

export function useFilteredTrips(trips, { search = '', duration = 'all', featuredOnly = false }) {
  return useMemo(() => {
    return trips.filter((trip) => {
      if (featuredOnly && !trip.featured) return false
      if (!tripMatchesSearch(trip, search)) return false
      if (!tripMatchesDuration(trip, duration)) return false
      return true
    })
  }, [trips, search, duration, featuredOnly])
}

export function useTripBySlug(slug) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    fetchTripBySlug(slug).then(({ data, error: fetchError }) => {
      if (cancelled) return
      setTrip(data)
      setError(fetchError)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [slug])

  return { trip, loading, error }
}

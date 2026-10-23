import { supabase } from '@/lib/supabaseClient'
import { TRIP_STATUS } from '@/utils/constants'

const adminTripListSelect = `
  id,
  title,
  slug,
  destination,
  duration_days,
  price_per_person,
  capacity,
  featured,
  status,
  created_at,
  trip_images ( storage_path, is_cover, display_order ),
  trip_dates ( id, departure_date, return_date, available_seats, status )
`

export async function fetchAdminTrips() {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('trips')
    .select(adminTripListSelect)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error: error?.message ?? null }
}

export async function fetchAdminTripById(tripId) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      trip_images ( id, storage_path, alt_text, is_cover, display_order ),
      trip_dates ( id, departure_date, return_date, available_seats, status )
    `,
    )
    .eq('id', tripId)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Trip not found.' }
  return { data, error: null }
}

export async function updateTripStatus(tripId, status) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const allowed = [TRIP_STATUS.DRAFT, TRIP_STATUS.PUBLISHED, TRIP_STATUS.ARCHIVED]
  if (!allowed.includes(status)) return { data: null, error: 'Invalid status.' }

  const { data, error } = await supabase
    .from('trips')
    .update({ status })
    .eq('id', tripId)
    .select('id, status')
    .single()

  return { data, error: error?.message ?? null }
}

export async function upsertAdminTrip(tripId, payload) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const row = {
    title: payload.title.trim(),
    slug: payload.slug.trim(),
    destination: payload.destination.trim(),
    starting_location: payload.starting_location?.trim() || 'Lucknow',
    duration_days: Number(payload.duration_days),
    price_per_person: Number(payload.price_per_person),
    capacity: Number(payload.capacity),
    featured: Boolean(payload.featured),
    status: payload.status,
    description: payload.description?.trim() || null,
    accommodation: payload.accommodation?.trim() || null,
    transportation: payload.transportation?.trim() || null,
    meals: payload.meals?.trim() || null,
    cancellation_policy: payload.cancellation_policy?.trim() || null,
    inclusions: payload.inclusions ?? [],
    exclusions: payload.exclusions ?? [],
  }

  if (tripId) {
    const { data, error } = await supabase
      .from('trips')
      .update(row)
      .eq('id', tripId)
      .select('id, slug')
      .single()
    return { data, error: error?.message ?? null }
  }

  const { data, error } = await supabase.from('trips').insert(row).select('id, slug').single()
  return { data, error: error?.message ?? null }
}

export async function fetchAdminTripMetrics() {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase.from('trips').select('status')
  if (error) return { data: null, error: error.message }

  const rows = data ?? []
  return {
    data: {
      total: rows.length,
      published: rows.filter((t) => t.status === TRIP_STATUS.PUBLISHED).length,
      draft: rows.filter((t) => t.status === TRIP_STATUS.DRAFT).length,
      archived: rows.filter((t) => t.status === TRIP_STATUS.ARCHIVED).length,
    },
    error: null,
  }
}

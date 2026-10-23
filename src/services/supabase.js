import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { TRIP_STATUS } from '@/utils/constants'

export { isSupabaseConfigured }

export async function fetchPublishedTrips() {
  if (!supabase) return { data: [], error: 'not_configured' }
  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      id,
      title,
      slug,
      destination,
      duration_days,
      price_per_person,
      featured,
      trip_images ( storage_path, alt_text, is_cover, display_order )
    `,
    )
    .eq('status', TRIP_STATUS.PUBLISHED)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
  return { data: data ?? [], error: error?.message ?? null }
}

export async function fetchTripBySlug(slug) {
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
    .eq('slug', slug)
    .eq('status', TRIP_STATUS.PUBLISHED)
    .maybeSingle()
  return { data, error: error?.message ?? null }
}

/** Lightweight connectivity check for Phase 1 setup verification. */
export async function pingSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'not_configured' }
  }

  const { error } = await supabase.from('trips').select('id').limit(1)
  if (error) {
    const schemaNotReady =
      error.code === 'PGRST116' ||
      error.code === 'PGRST205' ||
      /does not exist|schema cache/i.test(error.message ?? '')
    if (schemaNotReady) {
      return { ok: true, note: 'connected_schema_pending' }
    }
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

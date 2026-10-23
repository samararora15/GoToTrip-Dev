import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else if (import.meta.env.DEV) {
  console.warn(
    '[GoToTrip] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and add your project keys.',
  )
}

export { supabase }

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase)
}

/**
 * App smoke tests (Supabase + auth). Run: node scripts/smoke-test-app.mjs
 * Optional: SMOKE_EMAIL / SMOKE_PASSWORD in env for authenticated tests.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = Object.fromEntries(
  fs
    .readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const sb = createClient(url, anon)
let failed = 0
function ok(label, cond) {
  if (!cond) {
    console.error('FAIL', label)
    failed++
  } else console.log('OK', label)
}

const { data: trips, error: tripsErr } = await sb
  .from('trips')
  .select('id, slug, status')
  .eq('status', 'published')
  .limit(1)
ok('published trips readable', !tripsErr && trips?.length > 0)

const { data: anonBookings, error: anonBookingsErr } = await sb
  .from('bookings')
  .select('id')
  .limit(1)
ok(
  'bookings not readable by anon',
  Boolean(anonBookingsErr) || (Array.isArray(anonBookings) && anonBookings.length === 0),
)

const email = process.env.SMOKE_EMAIL
const password = process.env.SMOKE_PASSWORD
if (email && password) {
  const { error: signErr } = await sb.auth.signInWithPassword({ email, password })
  ok('smoke sign in', !signErr)
  const uid = (await sb.auth.getUser()).data.user?.id
  if (uid) {
    const { data: mine, error: mineErr } = await sb
      .from('bookings')
      .select('id, booking_number, trips(title)')
      .eq('user_id', uid)
    ok('my bookings query', !mineErr && Array.isArray(mine))
  }
} else {
  console.log('SKIP authenticated tests (set SMOKE_EMAIL + SMOKE_PASSWORD)')
}

process.exit(failed ? 1 : 0)

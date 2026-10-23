import { supabase } from '@/lib/supabaseClient'
import { sendBookingConfirmation } from '@/services/email'
import { BOOKING_STATUS, PAYMENT_STATUS, TRIP_DATE_STATUS } from '@/utils/constants'

const adminBookingListSelect = `
  id,
  booking_number,
  status,
  traveler_count,
  total_amount,
  created_at,
  notes,
  trip_date_id,
  profiles ( name, email, phone ),
  trips ( title, slug, destination ),
  trip_dates ( departure_date, return_date, available_seats, status ),
  payments ( id, status, screenshot_path, amount, upi_id_shown )
`

const adminBookingDetailSelect = `
  id,
  booking_number,
  status,
  traveler_count,
  total_amount,
  created_at,
  notes,
  trip_date_id,
  user_id,
  profiles ( name, email, phone ),
  trips ( id, title, slug, destination, starting_location, price_per_person, duration_days ),
  trip_dates ( id, departure_date, return_date, available_seats, status ),
  travelers ( full_name, age, gender, contact_number, email ),
  payments ( id, status, screenshot_path, amount, upi_id_shown, verified_at )
`

export async function fetchAdminBookings({ status = 'all' } = {}) {
  if (!supabase) return { data: null, error: 'not_configured' }

  let query = supabase
    .from('bookings')
    .select(adminBookingListSelect)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  return { data: data ?? [], error: error?.message ?? null }
}

export async function fetchAdminBookingById(bookingId) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('bookings')
    .select(adminBookingDetailSelect)
    .eq('id', bookingId)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Booking not found.' }
  return { data, error: null }
}

export async function fetchAdminBookingMetrics() {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('bookings')
    .select('status, total_amount')

  if (error) return { data: null, error: error.message }

  const rows = data ?? []
  const metrics = {
    total: rows.length,
    payment_pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
    pending_amount: 0,
  }

  for (const row of rows) {
    if (row.status === BOOKING_STATUS.PAYMENT_PENDING) {
      metrics.payment_pending++
      metrics.pending_amount += Number(row.total_amount ?? 0)
    } else if (row.status === BOOKING_STATUS.CONFIRMED) metrics.confirmed++
    else if (row.status === BOOKING_STATUS.REJECTED) metrics.rejected++
    else if (row.status === BOOKING_STATUS.CANCELLED) metrics.cancelled++
  }

  return { data: metrics, error: null }
}

async function adjustSeatsAfterConfirmation(tripDateId, travelerCount) {
  const { data: tripDate, error: fetchError } = await supabase
    .from('trip_dates')
    .select('id, available_seats, status')
    .eq('id', tripDateId)
    .maybeSingle()

  if (fetchError || !tripDate) {
    return { error: fetchError?.message ?? 'Departure date not found.' }
  }

  const nextSeats = Math.max(0, Number(tripDate.available_seats) - Number(travelerCount))
  const nextStatus =
    nextSeats === 0 ? TRIP_DATE_STATUS.FULL : tripDate.status

  const { error: updateError } = await supabase
    .from('trip_dates')
    .update({
      available_seats: nextSeats,
      status: nextStatus === TRIP_DATE_STATUS.CANCELLED ? tripDate.status : nextStatus,
    })
    .eq('id', tripDateId)

  return { error: updateError?.message ?? null }
}

/** Confirms booking + payment; sends confirmation email (failure does not roll back). */
export async function verifyBookingPayment(bookingId, adminUserId) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data: booking, error: loadError } = await fetchAdminBookingById(bookingId)
  if (loadError || !booking) return { data: null, error: loadError ?? 'Booking not found.' }

  if (booking.status !== BOOKING_STATUS.PAYMENT_PENDING) {
    return { data: null, error: 'Only pending bookings can be verified.' }
  }

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments
  if (!payment?.id) return { data: null, error: 'Payment record missing.' }

  const tripDate = booking.trip_dates
  const seatsAvailable = Number(tripDate?.available_seats ?? 0)
  const needed = Number(booking.traveler_count ?? 0)
  if (seatsAvailable < needed) {
    return {
      data: null,
      error: `Not enough seats on this departure (${seatsAvailable} available, ${needed} required). Reject or free seats before verifying.`,
    }
  }

  const verifiedAt = new Date().toISOString()

  const { data: confirmedRow, error: bookingError } = await supabase
    .from('bookings')
    .update({ status: BOOKING_STATUS.CONFIRMED })
    .eq('id', bookingId)
    .eq('status', BOOKING_STATUS.PAYMENT_PENDING)
    .select('id')
    .maybeSingle()

  if (bookingError) return { data: null, error: bookingError.message }
  if (!confirmedRow) {
    return { data: null, error: 'Booking was already processed by another admin.' }
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: PAYMENT_STATUS.VERIFIED,
      verified_by: adminUserId,
      verified_at: verifiedAt,
    })
    .eq('id', payment.id)

  if (paymentError) {
    await supabase
      .from('bookings')
      .update({ status: BOOKING_STATUS.PAYMENT_PENDING })
      .eq('id', bookingId)
    return { data: null, error: paymentError.message }
  }

  const { error: seatsError } = await adjustSeatsAfterConfirmation(
    booking.trip_date_id,
    booking.traveler_count,
  )
  if (seatsError) {
    return {
      data: { confirmed: true, seatsWarning: seatsError },
      error: null,
    }
  }

  const emailResult = await sendBookingConfirmation(bookingId)
  return {
    data: {
      confirmed: true,
      emailOk: emailResult.ok,
      emailError: emailResult.error ?? null,
    },
    error: null,
  }
}

export async function rejectBookingPayment(bookingId, adminUserId, note = '') {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data: booking, error: loadError } = await fetchAdminBookingById(bookingId)
  if (loadError || !booking) return { data: null, error: loadError ?? 'Booking not found.' }

  if (booking.status !== BOOKING_STATUS.PAYMENT_PENDING) {
    return { data: null, error: 'Only pending bookings can be rejected.' }
  }

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : booking.payments
  if (!payment?.id) return { data: null, error: 'Payment record missing.' }

  const trimmedNote = String(note ?? '').trim()

  const { data: rejectedRow, error: bookingError } = await supabase
    .from('bookings')
    .update({
      status: BOOKING_STATUS.REJECTED,
      notes: trimmedNote || booking.notes || null,
    })
    .eq('id', bookingId)
    .eq('status', BOOKING_STATUS.PAYMENT_PENDING)
    .select('id')
    .maybeSingle()

  if (bookingError) return { data: null, error: bookingError.message }
  if (!rejectedRow) {
    return { data: null, error: 'Booking was already processed by another admin.' }
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: PAYMENT_STATUS.REJECTED,
      verified_by: adminUserId,
      verified_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  if (paymentError) {
    await supabase
      .from('bookings')
      .update({ status: BOOKING_STATUS.PAYMENT_PENDING, notes: booking.notes ?? null })
      .eq('id', bookingId)
    return { data: null, error: paymentError.message }
  }

  return {
    data: { rejected: true },
    error: null,
  }
}

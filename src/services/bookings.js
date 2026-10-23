import { supabase } from '@/lib/supabaseClient'
import { uploadPaymentScreenshot } from '@/services/storage'
import { BOOKING_STATUS, PAYMENT_STATUS, TRIP_DATE_STATUS, TRIP_STATUS } from '@/utils/constants'

export async function fetchTripForCheckout(tripId) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      id,
      title,
      slug,
      destination,
      price_per_person,
      duration_days,
      trip_dates ( id, departure_date, return_date, available_seats, status )
    `,
    )
    .eq('id', tripId)
    .eq('status', TRIP_STATUS.PUBLISHED)
    .maybeSingle()

  return { data, error: error?.message ?? null }
}

export async function fetchTripDateAvailability(tripDateId) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('trip_dates')
    .select('id, available_seats, status, trip_id')
    .eq('id', tripDateId)
    .maybeSingle()

  return { data, error: error?.message ?? null }
}

export async function submitBooking({
  userId,
  tripId,
  tripDateId,
  travelerCount,
  totalAmount,
  travelers,
  screenshotFile,
  upiIdShown,
}) {
  if (!supabase) return { data: null, error: 'not_configured' }

  const { data: tripDate, error: dateError } = await fetchTripDateAvailability(tripDateId)
  if (dateError || !tripDate) {
    return { data: null, error: 'Selected departure date is no longer available.' }
  }
  if (tripDate.trip_id !== tripId) {
    return { data: null, error: 'Invalid trip date for this booking.' }
  }
  if (tripDate.status !== TRIP_DATE_STATUS.OPEN) {
    return { data: null, error: 'This departure is not open for booking.' }
  }
  if (tripDate.available_seats < travelerCount) {
    return {
      data: null,
      error: `Only ${tripDate.available_seats} seat(s) left on this date.`,
    }
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: userId,
      trip_id: tripId,
      trip_date_id: tripDateId,
      traveler_count: travelerCount,
      total_amount: totalAmount,
      status: BOOKING_STATUS.PAYMENT_PENDING,
    })
    .select('id, booking_number')
    .single()

  if (bookingError || !booking) {
    return { data: null, error: bookingError?.message ?? 'Could not create booking.' }
  }

  const travelerRows = travelers.map((t) => ({
    booking_id: booking.id,
    full_name: t.full_name,
    age: t.age,
    gender: t.gender,
    contact_number: t.contact_number,
    email: t.email?.trim() || '',
  }))

  const { error: travelersError } = await supabase.from('travelers').insert(travelerRows)

  if (travelersError) {
    await supabase.from('bookings').delete().eq('id', booking.id)
    return { data: null, error: travelersError.message }
  }

  const { path: screenshotPath, error: uploadError } = await uploadPaymentScreenshot(
    userId,
    booking.id,
    screenshotFile,
  )

  if (uploadError) {
    await supabase.from('bookings').delete().eq('id', booking.id)
    return { data: null, error: uploadError }
  }

  const { error: paymentError } = await supabase.from('payments').insert({
    booking_id: booking.id,
    upi_id_shown: upiIdShown,
    screenshot_path: screenshotPath,
    amount: totalAmount,
    status: PAYMENT_STATUS.PENDING,
  })

  if (paymentError) {
    await supabase.from('bookings').delete().eq('id', booking.id)
    return { data: null, error: paymentError.message }
  }

  return {
    data: { bookingId: booking.id, bookingNumber: booking.booking_number },
    error: null,
  }
}

const bookingListSelect = `
  id,
  booking_number,
  traveler_count,
  total_amount,
  status,
  created_at,
  trips ( title, slug, destination ),
  trip_dates ( departure_date, return_date ),
  payments ( status )
`

const bookingDetailSelect = `
  id,
  booking_number,
  user_id,
  traveler_count,
  total_amount,
  status,
  notes,
  created_at,
  trips ( id, title, slug, destination, starting_location, price_per_person, duration_days ),
  trip_dates ( id, departure_date, return_date ),
  travelers ( id, full_name, age, gender, contact_number, email ),
  payments ( status, amount, upi_id_shown, screenshot_path, verified_at )
`

export async function fetchMyBookings(userId) {
  if (!supabase || !userId) return { data: null, error: 'not_configured' }

  const { data, error } = await supabase
    .from('bookings')
    .select(bookingListSelect)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error: error?.message ?? null }
}

export async function fetchBookingForCustomer(bookingId, userId) {
  if (!supabase || !userId) return { data: null, error: 'not_configured' }
  if (!bookingId) return { data: null, error: 'Booking not found.' }

  const { data, error } = await supabase
    .from('bookings')
    .select(bookingDetailSelect)
    .eq('id', bookingId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return { data: null, error: error.message }
  if (!data) return { data: null, error: 'Booking not found.' }
  return { data, error: null }
}

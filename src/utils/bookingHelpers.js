/** PostgREST may return 1:1 `payments` as object or array depending on schema cache. */
export function getBookingPayment(booking) {
  if (!booking?.payments) return null
  return Array.isArray(booking.payments) ? booking.payments[0] : booking.payments
}

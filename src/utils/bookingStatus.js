import { BOOKING_STATUS, PAYMENT_STATUS } from '@/utils/constants'

const BOOKING_LABELS = {
  [BOOKING_STATUS.PAYMENT_PENDING]: 'Awaiting verification',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.REJECTED]: 'Payment rejected',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
}

const PAYMENT_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending review',
  [PAYMENT_STATUS.VERIFIED]: 'Verified',
  [PAYMENT_STATUS.REJECTED]: 'Rejected',
}

/** Tailwind classes for status pills (booking row / detail). */
const BOOKING_STYLES = {
  [BOOKING_STATUS.PAYMENT_PENDING]: 'bg-amber-50 text-amber-900 border-amber-200',
  [BOOKING_STATUS.CONFIRMED]: 'bg-teal-50 text-teal-900 border-teal-200',
  [BOOKING_STATUS.REJECTED]: 'bg-red-50 text-red-800 border-red-200',
  [BOOKING_STATUS.CANCELLED]: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function getBookingStatusLabel(status) {
  return BOOKING_LABELS[status] ?? status ?? '—'
}

export function getPaymentStatusLabel(status) {
  return PAYMENT_LABELS[status] ?? status ?? '—'
}

export function getBookingStatusStyle(status) {
  return BOOKING_STYLES[status] ?? 'bg-surface text-muted border-border'
}

export function bookingStatusHelperText(status) {
  switch (status) {
    case BOOKING_STATUS.PAYMENT_PENDING:
      return 'We are reviewing your UPI payment screenshot. You will get an email once verified.'
    case BOOKING_STATUS.CONFIRMED:
      return 'Your payment is verified and your seats are confirmed.'
    case BOOKING_STATUS.REJECTED:
      return 'We could not verify your payment. See the note on this booking or contact support.'
    case BOOKING_STATUS.CANCELLED:
      return 'This booking was cancelled.'
    default:
      return ''
  }
}

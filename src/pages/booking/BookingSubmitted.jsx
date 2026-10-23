import { Link, Navigate, useLocation } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { Button } from '@/components/ui/button'
import { formatBookingNumber } from '@/utils/formatters'

export default function BookingSubmitted() {
  const location = useLocation()
  const bookingNumber = location.state?.bookingNumber
  const bookingId = location.state?.bookingId
  const warning = location.state?.warning

  if (!bookingNumber) {
    return <Navigate to="/my-bookings" replace />
  }

  return (
    <PageShell>
      <div className="max-w-lg">
        <h1 className="font-serif text-3xl">Booking submitted</h1>
        <p className="mt-3 text-muted">
          Thank you. We received your booking and payment screenshot.
        </p>

        <div className="mt-8 rounded-md border border-border bg-surface p-6">
          <p className="text-sm text-muted">Booking reference</p>
          <p className="mt-1 font-serif text-2xl text-accent">
            {formatBookingNumber(bookingNumber)}
          </p>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li>We will verify your UPI payment manually.</li>
          <li>Track status anytime under My bookings.</li>
          <li>After approval, you will receive a confirmation email.</li>
        </ul>

        {warning ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {warning}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {bookingId ? (
            <Button asChild>
              <Link to={`/booking/${bookingId}`}>View booking</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link to="/my-bookings">My bookings</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  )
}

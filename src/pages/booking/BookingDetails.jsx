import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { fetchBookingForCustomer } from '@/services/bookings'
import { getPaymentScreenshotSignedUrl } from '@/services/storage'
import {
  bookingStatusHelperText,
  getPaymentStatusLabel,
} from '@/utils/bookingStatus'
import { getBookingPayment } from '@/utils/bookingHelpers'
import { formatBookingNumber, formatDate } from '@/utils/formatters'

export default function BookingDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [screenshotUrl, setScreenshotUrl] = useState(null)
  const [screenshotError, setScreenshotError] = useState(null)

  useEffect(() => {
    if (!user?.id || !id) return
    let cancelled = false
    setLoading(true)
    fetchBookingForCustomer(id, user.id).then(({ data, error: err }) => {
      if (cancelled) return
      setBooking(data)
      setError(err)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [id, user?.id])

  useEffect(() => {
    const path = getBookingPayment(booking)?.screenshot_path
    if (!path) {
      setScreenshotUrl(null)
      return
    }
    let cancelled = false
    getPaymentScreenshotSignedUrl(path).then(({ url, error: err }) => {
      if (cancelled) return
      setScreenshotUrl(url)
      setScreenshotError(err)
    })
    return () => {
      cancelled = true
    }
  }, [booking])

  if (loading) {
    return (
      <PageShell>
        <p className="text-muted">Loading booking…</p>
      </PageShell>
    )
  }

  if (error || !booking) {
    return (
      <PageShell>
        <PageMeta title="Booking not found" />
        <h1 className="font-serif text-3xl">Booking not found</h1>
        <p className="mt-3 text-muted">
          {error || 'This booking does not exist or is not linked to your account.'}
        </p>
        <Button asChild className="mt-8" variant="outline">
          <Link to="/my-bookings">Back to my bookings</Link>
        </Button>
      </PageShell>
    )
  }

  const trip = booking.trips
  const tripDate = booking.trip_dates
  const payment = getBookingPayment(booking)
  const helper = bookingStatusHelperText(booking.status)

  return (
    <PageShell>
      <PageMeta
        title={`Booking ${formatBookingNumber(booking.booking_number)}`}
      />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Booking reference</p>
          <h1 className="font-serif text-3xl text-accent">
            {formatBookingNumber(booking.booking_number)}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Submitted {formatDate(booking.created_at)}
          </p>
        </div>
        <BookingStatusBadge status={booking.status} className="text-sm" />
      </div>

      {helper ? (
        <p className="mt-6 max-w-2xl text-sm text-muted">{helper}</p>
      ) : null}

      {booking.notes ? (
        <div className="mt-6 max-w-2xl rounded-md border border-border bg-surface p-4 text-sm">
          <p className="font-medium text-foreground">Note from GoToTrip</p>
          <p className="mt-2 text-muted">{booking.notes}</p>
        </div>
      ) : null}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_minmax(0,22rem)]">
        <div className="rounded-md border border-border bg-surface p-6">
          {trip && tripDate ? (
            <BookingSummary
              trip={trip}
              tripDate={tripDate}
              travelerCount={booking.traveler_count}
              totalAmount={booking.total_amount}
              travelers={booking.travelers ?? []}
            />
          ) : (
            <p className="text-sm text-muted">
              Trip details are unavailable. Your booking reference and status above are
              still valid — contact support if you need help.
            </p>
          )}
          {trip?.slug ? (
            <Link
              to={`/trips/${trip.slug}`}
              className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
            >
              View trip page
            </Link>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-md border border-border p-5 text-sm">
            <h2 className="font-serif text-lg">Payment</h2>
            {payment ? (
              <dl className="mt-4 space-y-2 text-muted">
                <div>
                  <dt className="text-xs uppercase tracking-wide">Status</dt>
                  <dd className="text-foreground">
                    {getPaymentStatusLabel(payment.status)}
                  </dd>
                </div>
                {payment.upi_id_shown ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide">UPI ID</dt>
                    <dd className="text-foreground">{payment.upi_id_shown}</dd>
                  </div>
                ) : null}
                {payment.verified_at ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide">Verified</dt>
                    <dd className="text-foreground">
                      {formatDate(payment.verified_at)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-3 text-muted">No payment record found.</p>
            )}
          </div>

          {payment?.screenshot_path ? (
            <div className="rounded-md border border-border p-5">
              <h2 className="font-serif text-lg">Payment screenshot</h2>
              {screenshotUrl ? (
                <a
                  href={screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block"
                >
                  <img
                    src={screenshotUrl}
                    alt="Your UPI payment screenshot"
                    className="max-h-64 w-full rounded border border-border object-contain"
                  />
                  <span className="mt-2 inline-block text-xs text-accent hover:underline">
                    Open full size
                  </span>
                </a>
              ) : screenshotError ? (
                <p className="mt-3 text-sm text-muted">
                  Could not load screenshot preview.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted">Loading preview…</p>
              )}
            </div>
          ) : null}
        </aside>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/my-bookings">All bookings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Contact support</Link>
        </Button>
      </div>
    </PageShell>
  )
}

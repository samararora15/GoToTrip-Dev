import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAdminBookingMetrics } from '@/services/adminBookings'
import { fetchAdminTripMetrics } from '@/services/adminTrips'
import { formatCurrency } from '@/utils/formatters'

export default function AdminDashboard() {
  const [bookingMetrics, setBookingMetrics] = useState(null)
  const [tripMetrics, setTripMetrics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchAdminBookingMetrics(), fetchAdminTripMetrics()]).then(
      ([bookings, trips]) => {
        if (cancelled) return
        if (bookings.error || trips.error) {
          setError(bookings.error || trips.error)
          return
        }
        setBookingMetrics(bookings.data)
        setTripMetrics(trips.data)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <PageShell>
      <PageMeta title="Admin" />
      <h1 className="font-serif text-3xl">Admin overview</h1>
      <p className="mt-2 text-muted">Verify UPI payments, manage trips, and monitor bookings.</p>

      {error ? (
        <p className="mt-8 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-normal text-muted">
              Pending verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl">{bookingMetrics?.payment_pending ?? '—'}</p>
            <p className="mt-1 text-xs text-muted">
              {bookingMetrics
                ? formatCurrency(bookingMetrics.pending_amount) + ' outstanding'
                : null}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-normal text-muted">
              Confirmed bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl">{bookingMetrics?.confirmed ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-normal text-muted">
              Published trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl">{tripMetrics?.published ?? '—'}</p>
            <p className="mt-1 text-xs text-muted">
              {tripMetrics ? `${tripMetrics.draft} draft · ${tripMetrics.archived} archived` : null}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans font-normal text-muted">
              Total bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-3xl">{bookingMetrics?.total ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/admin/bookings">Manage bookings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/trips">Manage trips</Link>
        </Button>
      </div>
    </PageShell>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingListCard } from '@/components/booking/BookingListCard'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { fetchMyBookings } from '@/services/bookings'
import { BOOKING_STATUS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'

function countByStatus(bookings, status) {
  return bookings.filter((b) => b.status === status).length
}

function nextUpcoming(bookings) {
  const active = bookings.filter(
    (b) =>
      b.status === BOOKING_STATUS.PAYMENT_PENDING || b.status === BOOKING_STATUS.CONFIRMED,
  )
  const withDate = active
    .map((b) => ({
      booking: b,
      departure: b.trip_dates?.departure_date,
    }))
    .filter((x) => x.departure)
    .sort((a, b) => String(a.departure).localeCompare(String(b.departure)))
  return withDate[0] ?? null
}

export default function CustomerDashboard() {
  const { profile, user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    setLoading(true)
    fetchMyBookings(user.id).then(({ data, error: err }) => {
      if (cancelled) return
      setBookings(data ?? [])
      setError(err)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const stats = useMemo(
    () => ({
      pending: countByStatus(bookings, BOOKING_STATUS.PAYMENT_PENDING),
      confirmed: countByStatus(bookings, BOOKING_STATUS.CONFIRMED),
      total: bookings.length,
    }),
    [bookings],
  )

  const upcoming = useMemo(() => nextUpcoming(bookings), [bookings])
  const recent = bookings.slice(0, 3)

  const greetingName = profile?.name?.split(' ')[0] || 'there'

  return (
    <PageShell>
      <PageMeta title="Dashboard" />
      <h1 className="font-serif text-3xl">Hi, {greetingName}</h1>
      <p className="mt-2 text-muted">Your trips and booking status at a glance.</p>

      {loading ? (
        <p className="mt-10 text-muted">Loading…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans font-normal text-muted">
                  Total bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans font-normal text-muted">
                  Awaiting verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans font-normal text-muted">
                  Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl">{stats.confirmed}</p>
              </CardContent>
            </Card>
          </div>

          {upcoming ? (
            <div className="mt-10 max-w-2xl rounded-md border border-border bg-surface p-6">
              <p className="text-sm font-medium text-accent">Next departure</p>
              <p className="mt-2 font-serif text-xl">
                {upcoming.booking.trips?.title ?? 'Trip'} ·{' '}
                {formatDate(upcoming.departure)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {upcoming.booking.trips?.destination}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to={`/booking/${upcoming.booking.id}`}>View booking</Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/my-bookings">All bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/trips">Book another trip</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/profile">Edit profile</Link>
            </Button>
          </div>

          {recent.length > 0 ? (
            <section className="mt-14">
              <h2 className="font-serif text-2xl">Recent bookings</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recent.map((b) => (
                  <li key={b.id}>
                    <BookingListCard booking={b} />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <div className="mt-14 max-w-md">
              <p className="text-muted">You have not booked a trip yet.</p>
              <Button asChild className="mt-4">
                <Link to="/trips">Explore trips</Link>
              </Button>
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}

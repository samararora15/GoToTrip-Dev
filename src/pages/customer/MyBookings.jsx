import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingListCard } from '@/components/booking/BookingListCard'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { fetchMyBookings } from '@/services/bookings'

export default function MyBookings() {
  const { user } = useAuth()
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

  return (
    <PageShell>
      <PageMeta title="My bookings" />
      <h1 className="font-serif text-3xl">My bookings</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Track payment verification and trip details for every booking on your account.
      </p>

      {loading ? (
        <p className="mt-10 text-muted">Loading bookings…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : bookings.length === 0 ? (
        <div className="mt-10 max-w-md rounded-md border border-border bg-surface p-8">
          <p className="font-serif text-xl">No bookings yet</p>
          <p className="mt-2 text-sm text-muted">
            When you book a trip, it will appear here with status and departure dates.
          </p>
          <Button asChild className="mt-6">
            <Link to="/trips">Browse trips</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {bookings.map((b) => (
            <li key={b.id}>
              <BookingListCard booking={b} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  )
}

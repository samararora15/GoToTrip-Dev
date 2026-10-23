import { Link } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { TripCard } from '@/components/trips/TripCard'
import { Button } from '@/components/ui/button'
import { usePublishedTrips } from '@/hooks/useTrips'

export default function Home() {
  const { trips, loading, error } = usePublishedTrips()
  const featured = trips.filter((t) => t.featured).slice(0, 3)

  return (
    <PageShell>
      <PageMeta
        title="Curated group trips from Lucknow"
        description="Browse departures, book seats, and pay via UPI. Email updates at every step."
        path="/"
      />

      <section className="max-w-2xl">
        <p className="text-sm font-medium text-accent">Trips from Lucknow</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          Travel together, without the booking chaos
        </h1>
        <p className="mt-5 text-lg text-muted">
          Browse curated departures, reserve your seats, and pay via UPI. We verify every
          payment manually so you always know where your trip stands.
        </p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link to="/trips">Browse trips</Link>
          </Button>
        </div>
      </section>

      <section className="mt-16 border-t border-border pt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl">Featured departures</h2>
            <p className="mt-2 text-muted">Hand-picked trips with fixed dates and clear pricing.</p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/trips">View all</Link>
          </Button>
        </div>

        {loading ? (
          <p className="mt-10 text-sm text-muted">Loading trips…</p>
        ) : error ? (
          <p className="mt-10 text-sm text-red-700">Could not load trips: {error}</p>
        ) : featured.length ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-sm text-muted">New trips will appear here soon.</p>
        )}
      </section>
    </PageShell>
  )
}

import { Link, useParams } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { TripGallery } from '@/components/trips/TripGallery'
import { TripItinerary } from '@/components/trips/TripItinerary'
import { Button } from '@/components/ui/button'
import { useTripBySlug } from '@/hooks/useTrips'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { getCoverImageUrl, getOpenTripDates } from '@/utils/tripHelpers'
import { TRIP_DATE_STATUS } from '@/utils/constants'

function BookingCard({ trip, openDates }) {
  return (
    <aside className="rounded-md border border-border bg-surface p-6">
      <p className="text-sm text-muted">From</p>
      <p className="font-serif text-3xl text-foreground">
        {formatCurrency(trip.price_per_person)}
      </p>
      <p className="text-sm text-muted">per person</p>

      <div className="mt-8">
        <p className="text-sm font-medium text-foreground">Upcoming dates</p>
        {openDates.length ? (
          <ul className="mt-3 space-y-3">
            {openDates.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-0.5 border-b border-border pb-3 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-foreground">
                  {formatDate(d.departure_date)} – {formatDate(d.return_date)}
                </span>
                <span className="text-muted">
                  {d.status === TRIP_DATE_STATUS.OPEN
                    ? `${d.available_seats} seats`
                    : d.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No open dates right now.</p>
        )}
      </div>

      <Button className="mt-8 w-full" size="lg" asChild>
        <Link to={`/checkout/${trip.id}`} state={{ from: `/trips/${trip.slug}` }}>
          Book this trip
        </Link>
      </Button>
      <p className="mt-3 text-center text-xs text-muted">Sign in required to complete checkout.</p>
    </aside>
  )
}

export default function TripDetail() {
  const { slug } = useParams()
  const { trip, loading, error } = useTripBySlug(slug)
  const openDates = trip ? getOpenTripDates(trip) : []
  const seoImage = trip ? getCoverImageUrl(trip) : null

  if (loading) {
    return (
      <PageShell>
        <p className="text-muted">Loading trip…</p>
      </PageShell>
    )
  }

  if (error || !trip) {
    return (
      <PageShell>
        <h1 className="font-serif text-3xl">Trip not found</h1>
        <p className="mt-3 text-muted">
          {error || 'This departure may have moved or is no longer published.'}
        </p>
        <Button className="mt-8" asChild>
          <Link to="/trips">Back to trips</Link>
        </Button>
      </PageShell>
    )
  }

  const metaDescription =
    trip.description?.slice(0, 155) ||
    `${trip.duration_days}-day trip to ${trip.destination} from ${trip.starting_location}.`

  return (
    <PageShell>
      <PageMeta
        title={trip.title}
        description={metaDescription}
        image={seoImage ?? undefined}
        path={`/trips/${trip.slug}`}
      />

      <header className="max-w-3xl">
        <p className="text-sm text-muted">{trip.destination}</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{trip.title}</h1>
        <p className="mt-3 text-muted">
          {trip.duration_days} days · Departing {trip.starting_location}
        </p>
      </header>

      {/* Gallery + booking card share one row so tops align */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <TripGallery images={trip.trip_images} title={trip.title} />
        <BookingCard trip={trip} openDates={openDates} />
      </div>

      <div className="mt-14">
        <TripItinerary trip={trip} />
      </div>
    </PageShell>
  )
}

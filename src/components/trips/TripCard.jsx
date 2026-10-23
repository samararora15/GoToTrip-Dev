import { Link } from 'react-router-dom'
import { formatCurrency } from '@/utils/formatters'
import { getCoverImageUrl } from '@/utils/tripHelpers'
import { cn } from '@/lib/utils'

export function TripCard({ trip, className }) {
  const imageUrl = getCoverImageUrl(trip)
  const cover = trip.trip_images?.find((i) => i.is_cover) ?? trip.trip_images?.[0]

  return (
    <Link
      to={`/trips/${trip.slug}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-accent/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={cover?.alt_text || trip.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-end p-4 text-sm text-muted">
            Photo coming soon
          </div>
        )}
        {trip.featured ? (
          <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-xs font-medium text-accent">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5 text-left">
        <p className="text-sm text-muted">{trip.destination}</p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-foreground group-hover:text-accent">
          {trip.title}
        </h2>
        <p className="mt-3 text-sm text-muted">
          {trip.duration_days} days · from {trip.starting_location}
        </p>
        <p className="mt-auto pt-4 text-base font-medium text-foreground">
          {formatCurrency(trip.price_per_person)}{' '}
          <span className="text-sm font-normal text-muted">/ person</span>
        </p>
      </div>
    </Link>
  )
}

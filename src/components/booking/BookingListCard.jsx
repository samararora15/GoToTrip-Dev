import { Link } from 'react-router-dom'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, formatBookingNumber } from '@/utils/formatters'

export function BookingListCard({ booking }) {
  const trip = booking.trips
  const tripDate = booking.trip_dates
  const title = trip?.title ?? 'Trip'

  return (
    <Card className="transition-colors hover:border-accent/40">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
        <div>
          <CardTitle className="text-lg">
            <Link to={`/booking/${booking.id}`} className="hover:text-accent">
              {title}
            </Link>
          </CardTitle>
          {trip?.destination ? (
            <p className="text-sm text-muted">{trip.destination}</p>
          ) : null}
        </div>
        <BookingStatusBadge status={booking.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted">
          Ref.{' '}
          <span className="font-medium text-foreground">
            {formatBookingNumber(booking.booking_number)}
          </span>
          {' · '}
          Booked {formatDate(booking.created_at)}
        </p>
        {tripDate ? (
          <p className="text-muted">
            Departure {formatDate(tripDate.departure_date)}
            {' – '}
            Return {formatDate(tripDate.return_date)}
          </p>
        ) : null}
        <p className="text-foreground">
          {booking.traveler_count} traveler(s) · {formatCurrency(booking.total_amount)}
        </p>
        <Link
          to={`/booking/${booking.id}`}
          className="inline-block pt-2 text-sm font-medium text-accent hover:underline"
        >
          View details
        </Link>
      </CardContent>
    </Card>
  )
}

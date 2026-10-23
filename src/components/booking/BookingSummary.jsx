import { formatCurrency, formatDate } from '@/utils/formatters'
import { GENDER_OPTIONS } from '@/utils/constants'

export function BookingSummary({ trip, tripDate, travelerCount, totalAmount, travelers }) {
  const genderLabel = (value) =>
    GENDER_OPTIONS.find((g) => g.value === value)?.label ?? value

  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-serif text-lg text-foreground">Trip</h3>
        <p className="mt-2 text-foreground">{trip.title}</p>
        <p className="text-muted">{trip.destination}</p>
        {tripDate ? (
          <p className="mt-2 text-muted">
            {formatDate(tripDate.departure_date)} – {formatDate(tripDate.return_date)}
          </p>
        ) : null}
      </section>

      <section className="border-t border-border pt-6">
        <h3 className="font-serif text-lg text-foreground">Travelers ({travelerCount})</h3>
        <ul className="mt-3 space-y-3">
          {travelers.map((t, i) => (
            <li key={i} className="text-muted">
              <span className="text-foreground">{t.full_name}</span>
              {' · '}
              {t.age} yrs · {genderLabel(t.gender)}
              <br />
              {t.contact_number}
              {t.email ? ` · ${t.email}` : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-muted">Total</span>
          <span className="font-serif text-2xl text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          {formatCurrency(trip.price_per_person)} × {travelerCount} traveler(s)
        </p>
      </section>
    </div>
  )
}

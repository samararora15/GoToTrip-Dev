function BulletList({ items, emptyLabel }) {
  if (!items?.length) {
    return <p className="text-sm text-muted">{emptyLabel}</p>
  }
  return (
    <ul className="space-y-2 text-sm text-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-accent" aria-hidden>
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function DetailBlock({ label, value }) {
  if (!value) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground">{label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{value}</p>
    </div>
  )
}

export function TripItinerary({ trip }) {
  return (
    <div className="space-y-10">
      {trip.description ? (
        <section>
          <h2 className="font-serif text-2xl text-foreground">About this trip</h2>
          <p className="mt-4 max-w-3xl text-muted leading-relaxed">{trip.description}</p>
        </section>
      ) : null}

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-serif text-xl text-foreground">Included</h3>
          <div className="mt-4">
            <BulletList items={trip.inclusions} emptyLabel="Details at booking." />
          </div>
        </div>
        <div>
          <h3 className="font-serif text-xl text-foreground">Not included</h3>
          <div className="mt-4">
            <BulletList items={trip.exclusions} emptyLabel="See trip notes for extras." />
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-t border-border pt-10 md:grid-cols-3">
        <DetailBlock label="Stay" value={trip.accommodation} />
        <DetailBlock label="Transport" value={trip.transportation} />
        <DetailBlock label="Meals" value={trip.meals} />
      </section>

      {trip.cancellation_policy ? (
        <section className="border-t border-border pt-10">
          <h3 className="font-serif text-xl text-foreground">Cancellation</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            {trip.cancellation_policy}
          </p>
          <p className="mt-2 text-sm text-muted">
            Full policy:{' '}
            <a href="/cancellation" className="text-accent hover:underline">
              Cancellation policy
            </a>
          </p>
        </section>
      ) : null}
    </div>
  )
}

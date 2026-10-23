import { useState } from 'react'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { TripCard } from '@/components/trips/TripCard'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFilteredTrips, usePublishedTrips } from '@/hooks/useTrips'
import { cn } from '@/lib/utils'

const durationOptions = [
  { value: 'all', label: 'Any length' },
  { value: 'short', label: 'Up to 4 days' },
  { value: 'medium', label: '5–6 days' },
  { value: 'long', label: '7+ days' },
]

export default function Trips() {
  const { trips, loading, error } = usePublishedTrips()
  const [search, setSearch] = useState('')
  const [duration, setDuration] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const filtered = useFilteredTrips(trips, { search, duration, featuredOnly })

  return (
    <PageShell>
      <PageMeta
        title="All trips"
        description="Search group trips from Lucknow by destination, duration, and departure dates."
        path="/trips"
      />

      <header className="max-w-2xl">
        <h1 className="font-serif text-3xl sm:text-4xl">All trips</h1>
        <p className="mt-3 text-muted">
          Fixed departures, transparent pricing, and human payment verification.
        </p>
      </header>

      <div className="mt-10 grid gap-6 border-y border-border py-8 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="space-y-6">
          <div>
            <Label htmlFor="trip-search">Search</Label>
            <Input
              id="trip-search"
              className="mt-2"
              placeholder="Destination or trip name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Duration</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {durationOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition-colors',
                    duration === opt.value
                      ? 'border-accent bg-surface text-foreground'
                      : 'border-border text-muted hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            Featured only
          </label>
        </aside>

        <div>
          {loading ? (
            <p className="text-sm text-muted">Loading trips…</p>
          ) : error ? (
            <p className="text-sm text-red-700">Could not load trips: {error}</p>
          ) : filtered.length ? (
            <>
              <p className="mb-6 text-sm text-muted">
                {filtered.length} trip{filtered.length === 1 ? '' : 's'}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">
              No trips match your filters. Try clearing search or duration.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  )
}

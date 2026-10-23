import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { fetchAdminTrips, updateTripStatus } from '@/services/adminTrips'
import { TRIP_STATUS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'

const STATUS_LABEL = {
  [TRIP_STATUS.PUBLISHED]: 'Published',
  [TRIP_STATUS.DRAFT]: 'Draft',
  [TRIP_STATUS.ARCHIVED]: 'Archived',
}

export default function ManageTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchAdminTrips().then(({ data, error: err }) => {
      setTrips(data ?? [])
      setError(err)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onStatusChange(tripId, status) {
    setUpdatingId(tripId)
    const { error: err } = await updateTripStatus(tripId, status)
    setUpdatingId(null)
    if (!err) load()
    else setError(err)
  }

  return (
    <PageShell>
      <PageMeta title="Manage trips" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Manage trips</h1>
          <p className="mt-2 text-muted">
            Publish or hide trips. Edit copy and pricing; add dates in Studio until image UI
            ships.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">Admin home</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/trips/new">New trip</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-muted">Loading trips…</p>
      ) : error ? (
        <p className="mt-10 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Trip</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {trips.map((trip) => {
                const openDates = (trip.trip_dates ?? []).filter((d) => d.status === 'open').length
                return (
                  <tr key={trip.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{trip.title}</p>
                      <p className="text-xs text-muted">{trip.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {formatCurrency(trip.price_per_person)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded border border-border bg-background px-2 py-1 text-sm"
                        value={trip.status}
                        disabled={updatingId === trip.id}
                        onChange={(e) => onStatusChange(trip.id, e.target.value)}
                        aria-label={`Status for ${trip.title}`}
                      >
                        {Object.entries(STATUS_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted">{openDates} open</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/trips/${trip.id}/edit`}
                        className="text-accent hover:underline"
                      >
                        Edit
                      </Link>
                      {trip.status === TRIP_STATUS.PUBLISHED ? (
                        <>
                          {' · '}
                          <Link
                            to={`/trips/${trip.slug}`}
                            className="text-muted hover:text-foreground"
                          >
                            View
                          </Link>
                        </>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  )
}

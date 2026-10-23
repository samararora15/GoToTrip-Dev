import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingStatusBadge } from '@/components/booking/BookingStatusBadge'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchAdminBookingById,
  fetchAdminBookings,
  rejectBookingPayment,
  verifyBookingPayment,
} from '@/services/adminBookings'
import { getPaymentScreenshotSignedUrl } from '@/services/storage'
import { BOOKING_STATUS } from '@/utils/constants'
import { getBookingPayment } from '@/utils/bookingHelpers'
import { formatBookingNumber, formatCurrency, formatDate } from '@/utils/formatters'

const FILTERS = [
  { value: BOOKING_STATUS.PAYMENT_PENDING, label: 'Pending' },
  { value: 'all', label: 'All' },
  { value: BOOKING_STATUS.CONFIRMED, label: 'Confirmed' },
  { value: BOOKING_STATUS.REJECTED, label: 'Rejected' },
]

export default function ManageBookings() {
  const { user } = useAuth()
  const [filter, setFilter] = useState(BOOKING_STATUS.PAYMENT_PENDING)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionError, setActionError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [acting, setActing] = useState(false)

  const loadList = useCallback(() => {
    setLoading(true)
    fetchAdminBookings({ status: filter }).then(({ data, error: err }) => {
      setBookings(data ?? [])
      setError(err)
      setLoading(false)
    })
  }, [filter])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    setActionError(null)
    setActionMessage(null)
    fetchAdminBookingById(selectedId).then(({ data, error: err }) => {
      if (cancelled) return
      setDetail(data)
      setDetailLoading(false)
      if (err) setActionError(err)
    })
    return () => {
      cancelled = true
    }
  }, [selectedId])

  useEffect(() => {
    const path = getBookingPayment(detail)?.screenshot_path
    if (!path) {
      setScreenshotUrl(null)
      return
    }
    let cancelled = false
    getPaymentScreenshotSignedUrl(path).then(({ url }) => {
      if (!cancelled) setScreenshotUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [detail])

  async function handleVerify() {
    if (!selectedId || !user?.id) return
    setActing(true)
    setActionError(null)
    setActionMessage(null)
    const { data, error: err } = await verifyBookingPayment(selectedId, user.id)
    setActing(false)
    if (err) {
      setActionError(err)
      return
    }
    let msg = 'Booking confirmed.'
    if (data?.seatsWarning) msg += ` Warning: ${data.seatsWarning}`
    if (data?.emailOk === false) {
      msg += ` Confirmation email failed: ${data.emailError ?? 'unknown error'}.`
    } else if (data?.emailOk) {
      msg += ' Confirmation email sent.'
    }
    setActionMessage(msg)
    loadList()
    fetchAdminBookingById(selectedId).then(({ data: refreshed }) => setDetail(refreshed))
  }

  async function handleReject() {
    if (!selectedId || !user?.id) return
    setActing(true)
    setActionError(null)
    setActionMessage(null)
    const { data, error: err } = await rejectBookingPayment(selectedId, user.id, rejectNote)
    setActing(false)
    if (err) {
      setActionError(err)
      return
    }
    setActionMessage('Booking rejected. Customer can see status in My bookings.')
    setRejectNote('')
    loadList()
    fetchAdminBookingById(selectedId).then(({ data: refreshed }) => setDetail(refreshed))
  }

  const profile = detail?.profiles
  const trip = detail?.trips
  const tripDate = detail?.trip_dates
  const payment = getBookingPayment(detail)
  const canAct = detail?.status === BOOKING_STATUS.PAYMENT_PENDING

  return (
    <PageShell className="max-w-7xl">
      <PageMeta title="Manage bookings" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Manage bookings</h1>
          <p className="mt-2 text-muted">Review payment screenshots and confirm or reject.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin">Back to admin</Link>
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            size="sm"
            variant={filter === f.value ? 'default' : 'outline'}
            onClick={() => {
              setFilter(f.value)
              setSelectedId(null)
            }}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section aria-label="Booking list">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : bookings.length === 0 ? (
            <p className="text-muted">No bookings in this filter.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {bookings.map((b) => {
                const customer = b.profiles
                const active = selectedId === b.id
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(b.id)}
                      className={`w-full px-4 py-4 text-left transition-colors hover:bg-surface ${
                        active ? 'bg-surface' : ''
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {formatBookingNumber(b.booking_number)}
                          </p>
                          <p className="text-sm text-muted">
                            {b.trips?.title ?? 'Trip'} · {customer?.name ?? customer?.email}
                          </p>
                          <p className="text-xs text-muted">
                            {formatDate(b.created_at)} · {formatCurrency(b.total_amount)}
                          </p>
                        </div>
                        <BookingStatusBadge status={b.status} />
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section aria-label="Booking detail" className="min-h-[12rem]">
          {!selectedId ? (
            <p className="text-muted">Select a booking to review payment and travelers.</p>
          ) : detailLoading ? (
            <p className="text-muted">Loading detail…</p>
          ) : !detail ? (
            <p className="text-muted">Could not load booking.</p>
          ) : (
            <div className="space-y-6 rounded-md border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Reference</p>
                  <p className="font-serif text-2xl text-accent">
                    {formatBookingNumber(detail.booking_number)}
                  </p>
                </div>
                <BookingStatusBadge status={detail.status} />
              </div>

              <div className="text-sm text-muted">
                <p>
                  <span className="text-foreground">Customer:</span>{' '}
                  {profile?.name ?? '—'} ({profile?.email})
                  {profile?.phone ? ` · ${profile.phone}` : null}
                </p>
              </div>

              {trip && tripDate ? (
                <BookingSummary
                  trip={trip}
                  tripDate={tripDate}
                  travelerCount={detail.traveler_count}
                  totalAmount={detail.total_amount}
                  travelers={detail.travelers ?? []}
                />
              ) : null}

              {payment?.screenshot_path ? (
                <div>
                  <p className="font-serif text-lg">Payment screenshot</p>
                  {screenshotUrl ? (
                    <a href={screenshotUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="mt-3 max-h-72 w-full rounded border border-border object-contain"
                      />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted">Loading image…</p>
                  )}
                  {payment.upi_id_shown ? (
                    <p className="mt-2 text-xs text-muted">UPI shown: {payment.upi_id_shown}</p>
                  ) : null}
                </div>
              ) : null}

              {canAct ? (
                <div className="space-y-4 border-t border-border pt-6">
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" disabled={acting} onClick={handleVerify}>
                      {acting ? 'Working…' : 'Verify payment'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reject-note">Reject with note (optional)</Label>
                    <Textarea
                      id="reject-note"
                      rows={3}
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="Note for the customer (shown on their booking)…"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={acting}
                      onClick={handleReject}
                    >
                      Reject payment
                    </Button>
                  </div>
                </div>
              ) : null}

              {actionError ? (
                <p className="text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              ) : null}
              {actionMessage ? (
                <p className="text-sm text-teal-800" role="status">
                  {actionMessage}
                </p>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}

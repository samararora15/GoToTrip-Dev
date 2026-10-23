import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { TravelerFields } from '@/components/booking/TravelerFields'
import { UPIPaymentBlock } from '@/components/booking/UPIPaymentBlock'
import { PageShell } from '@/components/pages/PageShell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { fetchTripForCheckout, submitBooking } from '@/services/bookings'
import { getOpenTripDates } from '@/utils/tripHelpers'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { checkoutTravelersSchema } from '@/utils/validators'
import { getUpiConfig } from '@/utils/checkoutConfig'
import { cn } from '@/lib/utils'

const STEPS = ['Departure', 'Travelers', 'Review', 'Payment']

function emptyTraveler(seed = {}) {
  return {
    full_name: seed.full_name ?? '',
    age: seed.age ?? '',
    gender: seed.gender ?? '',
    contact_number: seed.contact_number ?? '',
    email: seed.email ?? '',
  }
}

export default function Checkout() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [trip, setTrip] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loadingTrip, setLoadingTrip] = useState(true)

  const [step, setStep] = useState(0)
  const [tripDateId, setTripDateId] = useState('')
  const [travelerCount, setTravelerCount] = useState(1)
  const [confirmedTravelers, setConfirmedTravelers] = useState([])
  const [stepError, setStepError] = useState(null)

  const [screenshotFile, setScreenshotFile] = useState(null)
  const [screenshotError, setScreenshotError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const openDates = useMemo(() => (trip ? getOpenTripDates(trip) : []), [trip])
  const selectedDate = openDates.find((d) => d.id === tripDateId)
  const maxTravelers = selectedDate
    ? Math.max(1, Math.min(selectedDate.available_seats, 20))
    : 1
  const totalAmount = trip ? Number(trip.price_per_person) * travelerCount : 0

  const travelersSchema = useMemo(
    () => checkoutTravelersSchema(travelerCount),
    [travelerCount],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(travelersSchema),
    defaultValues: { travelers: [emptyTraveler()] },
  })

  useEffect(() => {
    let cancelled = false
    setLoadingTrip(true)
    fetchTripForCheckout(tripId).then(({ data, error }) => {
      if (cancelled) return
      setTrip(data)
      setLoadError(error)
      setLoadingTrip(false)
    })
    return () => {
      cancelled = true
    }
  }, [tripId])

  useEffect(() => {
    const seed = emptyTraveler({
      full_name: profile?.name ?? '',
      contact_number: profile?.phone ?? '',
      email: user?.email ?? profile?.email ?? '',
    })
    const travelers = Array.from({ length: travelerCount }, (_, i) =>
      i === 0 ? { ...seed } : emptyTraveler(),
    )
    reset({ travelers })
  }, [travelerCount, reset, profile?.name, profile?.phone, profile?.email, user?.email])

  function validateStep0() {
    if (!tripDateId) {
      setStepError('Choose a departure date.')
      return false
    }
    if (!selectedDate) {
      setStepError('That date is no longer available.')
      return false
    }
    if (travelerCount < 1 || travelerCount > maxTravelers) {
      setStepError(`Enter 1–${maxTravelers} traveler(s) for this date.`)
      return false
    }
    setStepError(null)
    return true
  }

  function goNext() {
    if (step === 0 && !validateStep0()) return
    setStepError(null)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setStepError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  function onSubmitTravelers(values) {
    setConfirmedTravelers(values.travelers)
    setStepError(null)
    setStep(2)
  }

  async function handlePaymentSubmit() {
    setScreenshotError(null)
    setStepError(null)

    if (!screenshotFile) {
      setScreenshotError('Upload your UPI payment screenshot.')
      return
    }

    const { upiId } = getUpiConfig()
    if (!upiId) {
      setStepError('Checkout is unavailable until UPI ID is configured.')
      return
    }

    if (!user?.id) {
      setStepError('You must be logged in to complete booking.')
      return
    }

    setSubmitting(true)
    const { data, error } = await submitBooking({
      userId: user.id,
      tripId: trip.id,
      tripDateId,
      travelerCount,
      totalAmount,
      travelers: confirmedTravelers,
      screenshotFile,
      upiIdShown: upiId,
    })
    setSubmitting(false)

    if (error && !data) {
      setStepError(error)
      return
    }

    if (!data?.bookingId || !data?.bookingNumber) {
      setStepError('Booking was saved incompletely. Check My bookings or contact support.')
      return
    }

    navigate('/booking/submitted', {
      replace: true,
      state: {
        bookingId: data.bookingId,
        bookingNumber: data.bookingNumber,
        warning: error ?? null,
      },
    })
  }

  const onTravelersStep = handleSubmit(onSubmitTravelers)

  if (loadingTrip) {
    return (
      <PageShell>
        <p className="text-muted">Loading checkout…</p>
      </PageShell>
    )
  }

  if (loadError || !trip) {
    return (
      <PageShell>
        <h1 className="font-serif text-3xl">Checkout unavailable</h1>
        <p className="mt-3 text-muted">{loadError || 'Trip not found or not published.'}</p>
        <Button className="mt-8" asChild>
          <Link to="/trips">Browse trips</Link>
        </Button>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="max-w-2xl">
        <p className="text-sm text-muted">Booking</p>
        <h1 className="mt-1 font-serif text-3xl">{trip.title}</h1>
        <p className="mt-2 text-muted">{trip.destination}</p>
      </header>

      <ol className="mt-8 flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={cn(
              'rounded-md border px-3 py-1',
              index === step
                ? 'border-accent bg-surface font-medium text-accent'
                : 'border-border text-muted',
            )}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs text-muted">
        Fields marked with <span className="text-red-600">*</span> are required.
      </p>

      <div className="mt-10 max-w-2xl">
        {step === 0 ? (
          <div className="space-y-6">
            {openDates.length === 0 ? (
              <p className="text-sm text-muted">No open departures for this trip right now.</p>
            ) : null}
            <div>
              <Label htmlFor="trip-date" required>
                Departure date
              </Label>
              <select
                id="trip-date"
                required
                aria-required="true"
                value={tripDateId}
                onChange={(e) => {
                  setTripDateId(e.target.value)
                  setTravelerCount(1)
                }}
                className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <option value="">Select a date</option>
                {openDates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {formatDate(d.departure_date)} – {formatDate(d.return_date)} (
                    {d.available_seats} seats)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="traveler-count" required>
                Number of travelers
              </Label>
              <input
                id="traveler-count"
                type="number"
                min={1}
                max={maxTravelers}
                required
                aria-required="true"
                value={travelerCount}
                onChange={(e) =>
                  setTravelerCount(Math.min(maxTravelers, Math.max(1, Number(e.target.value) || 1)))
                }
                className="mt-2 flex h-10 w-full max-w-[120px] rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
              <p className="mt-2 text-xs text-muted">Up to {maxTravelers} on this departure.</p>
            </div>
            {selectedDate ? (
              <p className="text-sm text-muted">
                Estimated total:{' '}
                <span className="font-medium text-foreground">
                  {formatCurrency(totalAmount)}
                </span>
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <form id="travelers-form" onSubmit={onTravelersStep} noValidate>
            {Array.from({ length: travelerCount }).map((_, index) => (
              <TravelerFields
                key={index}
                index={index}
                register={register}
                errors={errors}
              />
            ))}
          </form>
        ) : null}

        {step === 2 || step === 3 ? (
          <BookingSummary
            trip={trip}
            tripDate={selectedDate}
            travelerCount={travelerCount}
            totalAmount={totalAmount}
            travelers={confirmedTravelers}
          />
        ) : null}

        {step === 3 ? (
          <div className="mt-8 border-t border-border pt-8">
            <UPIPaymentBlock
              screenshotFile={screenshotFile}
              onScreenshotChange={setScreenshotFile}
              error={screenshotError}
            />
          </div>
        ) : null}

        {stepError ? (
          <p className="mt-6 text-sm text-red-700" role="alert">
            {stepError}
          </p>
        ) : null}

        <div className="mt-10 flex flex-wrap gap-3">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
              Back
            </Button>
          ) : null}
          {step === 0 ? (
            <Button type="button" onClick={goNext} disabled={!openDates.length}>
              Continue
            </Button>
          ) : null}
          {step === 1 ? (
            <Button type="submit" form="travelers-form">
              Continue to review
            </Button>
          ) : null}
          {step === 2 ? (
            <Button type="button" onClick={goNext}>
              Continue to payment
            </Button>
          ) : null}
          {step === 3 ? (
            <Button type="button" disabled={submitting} onClick={handlePaymentSubmit}>
              {submitting ? 'Submitting…' : 'Submit booking'}
            </Button>
          ) : null}
        </div>
      </div>
    </PageShell>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { fetchAdminTripById, upsertAdminTrip } from '@/services/adminTrips'
import { TRIP_STATUS } from '@/utils/constants'

const emptyForm = {
  title: '',
  slug: '',
  destination: '',
  starting_location: 'Lucknow',
  duration_days: 5,
  price_per_person: 0,
  capacity: 20,
  featured: false,
  status: TRIP_STATUS.DRAFT,
  description: '',
  accommodation: '',
  transportation: '',
  meals: '',
  cancellation_policy: '',
  inclusionsText: '',
  exclusionsText: '',
}

function splitLines(text) {
  return String(text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function TripEdit() {
  const { tripId } = useParams()
  const isNew = tripId === 'new' || !tripId
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    fetchAdminTripById(tripId).then(({ data, error: err }) => {
      if (cancelled) return
      if (err || !data) {
        setError(err ?? 'Trip not found')
        setLoading(false)
        return
      }
      setForm({
        title: data.title ?? '',
        slug: data.slug ?? '',
        destination: data.destination ?? '',
        starting_location: data.starting_location ?? 'Lucknow',
        duration_days: data.duration_days ?? 5,
        price_per_person: data.price_per_person ?? 0,
        capacity: data.capacity ?? 20,
        featured: Boolean(data.featured),
        status: data.status ?? TRIP_STATUS.DRAFT,
        description: data.description ?? '',
        accommodation: data.accommodation ?? '',
        transportation: data.transportation ?? '',
        meals: data.meals ?? '',
        cancellation_policy: data.cancellation_policy ?? '',
        inclusionsText: (data.inclusions ?? []).join('\n'),
        exclusionsText: (data.exclusions ?? []).join('\n'),
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [isNew, tripId])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload = {
      ...form,
      duration_days: Number(form.duration_days),
      price_per_person: Number(form.price_per_person),
      capacity: Number(form.capacity),
      inclusions: splitLines(form.inclusionsText),
      exclusions: splitLines(form.exclusionsText),
    }
    const { data, error: err } = await upsertAdminTrip(isNew ? null : tripId, payload)
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    navigate('/admin/trips', { replace: true, state: { saved: data?.slug } })
  }

  if (loading) {
    return (
      <PageShell>
        <p className="text-muted">Loading trip…</p>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageMeta title={isNew ? 'New trip' : 'Edit trip'} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-3xl">{isNew ? 'New trip' : 'Edit trip'}</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/trips">Back to trips</Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-10 max-w-2xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title" required>
              Title
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug" required>
              Slug
            </Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => updateField('status', e.target.value)}
            >
              <option value={TRIP_STATUS.DRAFT}>Draft</option>
              <option value={TRIP_STATUS.PUBLISHED}>Published</option>
              <option value={TRIP_STATUS.ARCHIVED}>Archived</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination" required>
              Destination
            </Label>
            <Input
              id="destination"
              value={form.destination}
              onChange={(e) => updateField('destination', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="starting_location">Starting location</Label>
            <Input
              id="starting_location"
              value={form.starting_location}
              onChange={(e) => updateField('starting_location', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_days" required>
              Duration (days)
            </Label>
            <Input
              id="duration_days"
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(e) => updateField('duration_days', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_per_person" required>
              Price per person (INR)
            </Label>
            <Input
              id="price_per_person"
              type="number"
              min={0}
              step="0.01"
              value={form.price_per_person}
              onChange={(e) => updateField('price_per_person', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity" required>
              Capacity
            </Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => updateField('capacity', e.target.value)}
              required
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField('featured', e.target.checked)}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="featured">Featured on homepage</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="inclusions">Inclusions (one per line)</Label>
          <Textarea
            id="inclusions"
            rows={4}
            value={form.inclusionsText}
            onChange={(e) => updateField('inclusionsText', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclusions">Exclusions (one per line)</Label>
          <Textarea
            id="exclusions"
            rows={3}
            value={form.exclusionsText}
            onChange={(e) => updateField('exclusionsText', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancellation_policy">Cancellation policy</Label>
          <Textarea
            id="cancellation_policy"
            rows={3}
            value={form.cancellation_policy}
            onChange={(e) => updateField('cancellation_policy', e.target.value)}
          />
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create trip' : 'Save trip'}
        </Button>
      </form>
    </PageShell>
  )
}

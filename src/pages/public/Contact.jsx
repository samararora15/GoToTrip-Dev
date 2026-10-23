import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendContactForm } from '@/services/email'
import { SITE } from '@/utils/constants'
import { contactFormSchema } from '@/utils/validators'

export default function Contact() {
  const [submitState, setSubmitState] = useState({ type: 'idle', message: '' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  async function onSubmit(values) {
    setSubmitState({ type: 'idle', message: '' })
    const result = await sendContactForm(values)
    if (result.ok) {
      reset()
      setSubmitState({
        type: 'success',
        message: 'Thanks — we received your message and will reply by email.',
      })
      return
    }
    setSubmitState({
      type: 'error',
      message: result.error || 'Something went wrong. Please try again.',
    })
  }

  return (
    <PageShell>
      <PageMeta
        title="Contact"
        description="Questions about trips, payments, or group bookings — reach GoToTrip by email."
        path="/contact"
      />

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Contact us</h1>
          <p className="mt-3 max-w-md text-muted">
            Ask about departures, custom groups, or UPI payment verification. We respond by
            email, usually within one business day.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>
              <span className="text-foreground">Email:</span>{' '}
              <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
            </li>
            <li>
              <span className="text-foreground">Phone:</span> {SITE.supportPhone}
            </li>
          </ul>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-md border border-border bg-surface p-6 sm:p-8"
          noValidate
        >
          <div>
            <Label htmlFor="contact-name" required>
              Name
            </Label>
            <Input id="contact-name" className="mt-2" {...register('name')} />
            {errors.name ? (
              <p className="mt-1 text-sm text-red-700">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="contact-email" required>
              Email
            </Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              className="mt-2"
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-1 text-sm text-red-700">{errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="contact-message" required>
              Message
            </Label>
            <Textarea id="contact-message" className="mt-2" {...register('message')} />
            {errors.message ? (
              <p className="mt-1 text-sm text-red-700">{errors.message.message}</p>
            ) : null}
          </div>

          {submitState.type === 'success' ? (
            <p className="text-sm text-accent" role="status">
              {submitState.message}
            </p>
          ) : null}
          {submitState.type === 'error' ? (
            <p className="text-sm text-red-700" role="alert">
              {submitState.message}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Sending…' : 'Send message'}
          </Button>
        </form>
      </div>
    </PageShell>
  )
}

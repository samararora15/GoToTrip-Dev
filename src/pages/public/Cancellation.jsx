import { PolicyLayout } from '@/components/pages/PolicyLayout'
import { APP_NAME } from '@/utils/constants'

export default function Cancellation() {
  return (
    <PolicyLayout
      title="Cancellation policy"
      description={`Cancellation and refund rules for ${APP_NAME} group trips.`}
    >
      <p>
        Each trip may include additional rules on its detail page. The timelines below apply
        unless a specific departure states otherwise.
      </p>
      <section>
        <h2 className="font-serif text-lg text-foreground">Before payment verification</h2>
        <p className="mt-2">
          If we have not confirmed your booking, you may withdraw by contacting us. No charge
          applies beyond any bank/UPI fees from your payment attempt.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">After confirmation</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>15+ days before departure: typically 50% refund of land package (see trip page)</li>
          <li>7–14 days: partial refund or credit toward a future date, at our discretion</li>
          <li>Within 7 days: generally non-refundable due to committed hotel and transport blocks</li>
        </ul>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Trip cancelled by {APP_NAME}</h2>
        <p className="mt-2">
          If we cancel a departure, you may choose a full refund of amounts paid to us or transfer
          to the next available date for the same trip.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">How to cancel</h2>
        <p className="mt-2">
          Email support with your booking number. Refunds, when applicable, are processed to the
          original UPI account within 7–10 business days after approval.
        </p>
      </section>
    </PolicyLayout>
  )
}

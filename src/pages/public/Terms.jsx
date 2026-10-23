import { PolicyLayout } from '@/components/pages/PolicyLayout'
import { APP_NAME } from '@/utils/constants'

export default function Terms() {
  return (
    <PolicyLayout
      title="Terms & conditions"
      description={`Terms of use for booking group trips with ${APP_NAME}.`}
    >
      <p>
        By using {APP_NAME} and submitting a booking, you agree to these terms. We organise
        group departures from Lucknow; each trip page lists inclusions, exclusions, and
        pricing for that departure.
      </p>
      <section>
        <h2 className="font-serif text-lg text-foreground">Bookings & payment</h2>
        <p className="mt-2">
          A booking is request until we verify your UPI payment screenshot. You must pay the
          amount shown at checkout and upload a clear screenshot. False or misleading payment
          proof may lead to cancellation.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Traveler information</h2>
        <p className="mt-2">
          You are responsible for accurate names, contact details, and IDs required for travel.
          Government-issued ID may be required on departure.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Changes & cancellations</h2>
        <p className="mt-2">
          Trip-specific cancellation rules appear on each trip page and in our cancellation
          policy. We may cancel or reschedule a departure due to safety, permits, or insufficient
          group size; we will notify you by email with options.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Liability</h2>
        <p className="mt-2">
          Adventure and pilgrimage travel involves inherent risk. {APP_NAME} acts as an organiser
          and coordinator; carriers, hotels, and activity operators are third parties. Travel
          insurance is strongly recommended.
        </p>
      </section>
    </PolicyLayout>
  )
}

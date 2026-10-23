import { PolicyLayout } from '@/components/pages/PolicyLayout'
import { APP_NAME } from '@/utils/constants'

export default function Privacy() {
  return (
    <PolicyLayout
      title="Privacy policy"
      description={`How ${APP_NAME} collects, uses, and protects your personal data.`}
    >
      <p>
        We collect information you provide when you create an account, book a trip, or contact
        us — including name, email, phone, traveler details, and payment screenshots.
      </p>
      <section>
        <h2 className="font-serif text-lg text-foreground">How we use data</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Process bookings and verify UPI payments</li>
          <li>Send booking and trip updates by email</li>
          <li>Respond to support messages</li>
          <li>Improve our trips and website</li>
        </ul>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Storage & security</h2>
        <p className="mt-2">
          Trip photos are stored in public storage. Payment screenshots are stored privately and
          accessed only via signed URLs by you and our admin team. Data is hosted on Supabase
          with row-level security on bookings and profiles.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Sharing</h2>
        <p className="mt-2">
          We do not sell your data. We share traveler names with hotels and transport partners
          only as needed to operate your trip.
        </p>
      </section>
      <section>
        <h2 className="font-serif text-lg text-foreground">Your choices</h2>
        <p className="mt-2">
          You may request correction of profile data or ask us to delete account information
          where legally permitted, by emailing support.
        </p>
      </section>
    </PolicyLayout>
  )
}

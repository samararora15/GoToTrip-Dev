import { Link } from 'react-router-dom'
import { APP_NAME, SITE } from '@/utils/constants'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="font-serif text-lg text-foreground">{APP_NAME}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Curated group journeys from Lucknow. Simple booking, human verification, email
            updates you can trust.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Policies</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link to="/terms">Terms &amp; conditions</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy policy</Link>
            </li>
            <li>
              <Link to="/cancellation">Cancellation policy</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>
            </li>
            <li>{SITE.supportPhone}</li>
            <li>
              <Link to="/contact">Send a message</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted sm:px-6">
        © {year} {APP_NAME}. All rights reserved.
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <PageShell>
      <h1 className="font-serif text-3xl">Page not found</h1>
      <p className="mt-3 text-muted">That route doesn&apos;t exist or has moved.</p>
      <Button className="mt-8" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </PageShell>
  )
}

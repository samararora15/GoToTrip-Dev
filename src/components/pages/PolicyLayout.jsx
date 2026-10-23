import { useLocation } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'

export function PolicyLayout({ title, description, children }) {
  const { pathname } = useLocation()

  return (
    <PageShell>
      <PageMeta title={title} description={description} path={pathname} />
      <header className="max-w-3xl">
        <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: March 2026</p>
      </header>
      <article className="mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-muted">
        {children}
      </article>
    </PageShell>
  )
}

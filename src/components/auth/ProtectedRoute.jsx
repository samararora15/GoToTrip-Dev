import { Navigate, useLocation } from 'react-router-dom'
import { PageShell } from '@/components/pages/PageShell'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading, profileReady, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <PageShell>
        <p className="text-muted">Checking your session…</p>
      </PageShell>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requireAdmin) {
    if (!profileReady) {
      return (
        <PageShell>
          <p className="text-muted">Loading your profile…</p>
        </PageShell>
      )
    }
    if (!isAdmin) {
      return (
        <PageShell>
          <h1 className="font-serif text-3xl">Access denied</h1>
          <p className="mt-3 text-muted">This area is for administrators only.</p>
        </PageShell>
      )
    }
  }

  return children
}

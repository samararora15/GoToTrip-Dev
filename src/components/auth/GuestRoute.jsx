import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/** Redirect signed-in users away from login/signup. */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname

  if (loading) {
    return <p className="sr-only">Loading session…</p>
  }

  if (user) {
    return <Navigate to={from || '/dashboard'} replace />
  }

  return children
}

import { NavLink, Link } from 'react-router-dom'
import { APP_NAME } from '@/utils/constants'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const navLinkClass = ({ isActive }) =>
  cn(
    'text-sm text-muted transition-colors hover:text-foreground',
    isActive && 'text-accent font-medium',
  )

const adminNavLinkClass = ({ isActive }) =>
  cn(
    'text-sm font-semibold text-accent transition-colors hover:text-accent-hover',
    isActive && 'underline underline-offset-4 decoration-accent',
  )

export function Navbar() {
  const { user, profile, loading, isAdmin, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="font-serif text-xl font-semibold text-foreground">
          {APP_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          <NavLink to="/trips" className={navLinkClass}>
            Trips
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
          {user ? (
            <NavLink to="/my-bookings" className={navLinkClass}>
              My bookings
            </NavLink>
          ) : null}
          {isAdmin ? (
            <NavLink to="/admin" className={adminNavLinkClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-muted">…</span>
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/profile">{profile?.name || 'Account'}</Link>
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={handleSignOut}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

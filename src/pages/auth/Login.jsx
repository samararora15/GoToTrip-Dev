import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signInWithEmail } from '@/services/auth'
import { loginSchema } from '@/utils/validators'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [authError, setAuthError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values) {
    setAuthError(null)
    const { error } = await signInWithEmail(values.email, values.password)
    if (error) {
      setAuthError(error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <PageShell>
      <PageMeta title="Log in" description="Sign in to book trips and manage your bookings." path="/login" />

      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl">Log in</h1>
        <p className="mt-2 text-sm text-muted">
          Book trips, track payment verification, and manage your profile.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5 rounded-md border border-border bg-surface p-6"
          noValidate
        >
          <div>
            <Label htmlFor="login-email" required>
              Email
            </Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-password" required>
              Password
            </Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className="mt-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>
            ) : null}
          </div>

          {authError ? (
            <p className="text-sm text-red-700" role="alert">
              {authError}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          No account?{' '}
          <Link to="/signup" state={location.state} className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </PageShell>
  )
}

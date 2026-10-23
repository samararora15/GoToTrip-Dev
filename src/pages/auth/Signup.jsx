import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUpWithEmail } from '@/services/auth'
import { signupSchema } from '@/utils/validators'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [authError, setAuthError] = useState(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values) {
    setAuthError(null)
    setCheckEmail(false)

    const { data, error } = await signUpWithEmail({
      email: values.email,
      password: values.password,
      name: values.name,
    })

    if (error) {
      setAuthError(error)
      return
    }

    if (data?.session) {
      navigate(from, { replace: true })
      return
    }

    setCheckEmail(true)
  }

  return (
    <PageShell>
      <PageMeta title="Sign up" description="Create a GoToTrip account to book group departures." path="/signup" />

      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-3xl">Create account</h1>
        <p className="mt-2 text-sm text-muted">One account for bookings, UPI verification, and email updates.</p>

        {checkEmail ? (
          <div className="mt-8 rounded-md border border-border bg-surface p-6 text-sm text-muted">
            <p className="text-foreground font-medium">Check your email</p>
            <p className="mt-2">
              We sent a confirmation link. After confirming,{' '}
              <Link to="/login" state={location.state} className="text-accent hover:underline">
                log in
              </Link>{' '}
              to continue.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-8 space-y-5 rounded-md border border-border bg-surface p-6"
            noValidate
          >
            <div>
              <Label htmlFor="signup-name" required>
                Full name
              </Label>
              <Input id="signup-name" autoComplete="name" className="mt-2" {...register('name')} />
              {errors.name ? (
                <p className="mt-1 text-sm text-red-700">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="signup-email" required>
                Email
              </Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password" required>
                Password
              </Label>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-red-700">{errors.password.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="signup-confirm" required>
                Confirm password
              </Label>
              <Input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                className="mt-2"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-red-700">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            {authError ? (
              <p className="text-sm text-red-700" role="alert">
                {authError}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" state={location.state} className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </PageShell>
  )
}

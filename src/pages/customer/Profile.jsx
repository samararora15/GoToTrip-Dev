import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/pages/PageShell'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from '@/services/auth'
import { profileSchema } from '@/utils/validators'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [saveError, setSaveError] = useState(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  useEffect(() => {
    reset({
      name: profile?.name ?? '',
      phone: profile?.phone ?? '',
    })
  }, [profile?.name, profile?.phone, reset])

  async function onSubmit(values) {
    setSaveError(null)
    setSaved(false)
    if (!user?.id) return

    const { error } = await updateProfile(user.id, {
      name: values.name,
      phone: values.phone,
    })

    if (error) {
      setSaveError(error)
      return
    }

    await refreshProfile()
    setSaved(true)
  }

  const loginEmail = user?.email ?? profile?.email ?? ''

  return (
    <PageShell>
      <PageMeta title="Profile" />
      <h1 className="font-serif text-3xl">Profile</h1>
      <p className="mt-2 max-w-xl text-muted">
        Update your name and phone. These pre-fill traveler details on checkout.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10 max-w-md space-y-6"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={loginEmail}
            readOnly
            disabled
            className="bg-surface text-muted"
          />
          <p className="text-xs text-muted">
            Login email is managed through your account sign-in settings.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-name" required>
            Full name
          </Label>
          <Input id="profile-name" autoComplete="name" {...register('name')} />
          {errors.name ? (
            <p className="text-sm text-red-700" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Mobile (optional)</Label>
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            {...register('phone')}
          />
          {errors.phone ? (
            <p className="text-sm text-red-700" role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        {saveError ? (
          <p className="text-sm text-red-700" role="alert">
            {saveError}
          </p>
        ) : null}
        {saved && !isDirty ? (
          <p className="text-sm text-teal-800" role="status">
            Profile saved.
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </PageShell>
  )
}

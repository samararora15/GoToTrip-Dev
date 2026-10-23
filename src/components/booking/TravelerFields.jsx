import { GENDER_OPTIONS } from '@/utils/constants'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function TravelerFields({ index, register, errors }) {
  const prefix = `travelers.${index}`
  const fieldErrors = errors?.travelers?.[index]

  return (
    <fieldset
      className={cn('rounded-md border border-border bg-background p-5', index > 0 && 'mt-4')}
    >
      <legend className="px-1 text-sm font-medium text-foreground">
        Traveler {index + 1}
      </legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor={`${prefix}.full_name`} required>
            Full name
          </Label>
          <Input
            id={`${prefix}.full_name`}
            className="mt-2"
            autoComplete="name"
            required
            aria-required="true"
            {...register(`${prefix}.full_name`)}
          />
          {fieldErrors?.full_name ? (
            <p className="mt-1 text-sm text-red-700">{fieldErrors.full_name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${prefix}.age`} required>
            Age
          </Label>
          <Input
            id={`${prefix}.age`}
            type="number"
            min={1}
            className="mt-2"
            required
            aria-required="true"
            {...register(`${prefix}.age`)}
          />
          {fieldErrors?.age ? (
            <p className="mt-1 text-sm text-red-700">{fieldErrors.age.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${prefix}.gender`} required>
            Gender
          </Label>
          <select
            id={`${prefix}.gender`}
            className="mt-2 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            required
            aria-required="true"
            {...register(`${prefix}.gender`)}
          >
            <option value="">Select</option>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {fieldErrors?.gender ? (
            <p className="mt-1 text-sm text-red-700">{fieldErrors.gender.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${prefix}.contact_number`} required>
            Contact number
          </Label>
          <Input
            id={`${prefix}.contact_number`}
            inputMode="numeric"
            autoComplete="tel"
            className="mt-2"
            required
            aria-required="true"
            {...register(`${prefix}.contact_number`)}
          />
          {fieldErrors?.contact_number ? (
            <p className="mt-1 text-sm text-red-700">{fieldErrors.contact_number.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor={`${prefix}.email`}>Email</Label>
          <Input
            id={`${prefix}.email`}
            type="email"
            autoComplete="email"
            className="mt-2"
            placeholder="Optional"
            {...register(`${prefix}.email`)}
          />
          {fieldErrors?.email ? (
            <p className="mt-1 text-sm text-red-700">{fieldErrors.email.message}</p>
          ) : null}
        </div>
      </div>
    </fieldset>
  )
}

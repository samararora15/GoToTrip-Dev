import { z } from 'zod'

const indianMobile = /^[6-9]\d{9}$/

export const genderSchema = z.enum(['male', 'female', 'other'], {
  error: 'Please select a gender',
})

export const travelerSchema = z.object({
  full_name: z.string().trim().min(1, 'Full name is required'),
  age: z.coerce
    .number({ error: 'Age is required' })
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1'),
  gender: genderSchema,
  contact_number: z
    .string()
    .trim()
    .regex(indianMobile, 'Enter a valid 10-digit Indian mobile number'),
  email: z.preprocess(
    (val) => (val == null ? '' : String(val).trim()),
    z.union([
      z.literal(''),
      z.string().email('Enter a valid email address'),
    ]),
  ),
})

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const checkoutTravelersSchema = (count) =>
  z.object({
    travelers: z
      .array(travelerSchema)
      .length(count, `Enter details for all ${count} traveler(s)`),
  })

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.preprocess(
    (val) => (val == null ? '' : String(val).trim()),
    z.union([
      z.literal(''),
      z.string().regex(indianMobile, 'Enter a valid 10-digit Indian mobile number'),
    ]),
  ),
})

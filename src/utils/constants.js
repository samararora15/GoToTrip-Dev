export const APP_NAME = 'GoToTrip'

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
}

export const TRIP_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const TRIP_DATE_STATUS = {
  OPEN: 'open',
  FULL: 'full',
  CANCELLED: 'cancelled',
}

export const BOOKING_STATUS = {
  PAYMENT_PENDING: 'payment_pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
}

export const NOTIFICATION_TYPE = {
  ACKNOWLEDGEMENT: 'acknowledgement',
  CONFIRMATION: 'confirmation',
  REJECTION: 'rejection',
}

export const NOTIFICATION_STATUS = {
  SENT: 'sent',
  FAILED: 'failed',
}

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const STORAGE_BUCKETS = {
  TRIP_IMAGES: 'trip-images',
  PAYMENT_SCREENSHOTS: 'payment-screenshots',
}

export const BOOKING_NUMBER_PREFIX = 'LKO'

export const SITE = {
  supportEmail: 'hello@gototrip.example',
  supportPhone: '+91 98765 43210',
}

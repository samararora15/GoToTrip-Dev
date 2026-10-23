import { supabase } from '@/lib/supabaseClient'
import { STORAGE_BUCKETS } from '@/utils/constants'

export const buckets = STORAGE_BUCKETS

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Public URL for trip gallery / cover images. */
export function getTripImagePublicUrl(storagePath) {
  if (!supabase || !storagePath) return null
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.TRIP_IMAGES)
    .getPublicUrl(storagePath)
  return data.publicUrl
}

/** Signed URL for a payment screenshot (private bucket). */
export async function getPaymentScreenshotSignedUrl(storagePath, expiresIn = 3600) {
  if (!supabase || !storagePath) return { url: null, error: 'not_configured' }
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.PAYMENT_SCREENSHOTS)
    .createSignedUrl(storagePath, expiresIn)
  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

export async function uploadPaymentScreenshot(userId, bookingId, file) {
  if (!supabase) return { path: null, error: 'not_configured' }
  if (!file) return { path: null, error: 'Payment screenshot is required.' }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { path: null, error: 'Upload a JPG, PNG, or WebP image.' }
  }

  const maxBytes = 10 * 1024 * 1024
  if (file.size > maxBytes) {
    return { path: null, error: 'Image must be 10 MB or smaller.' }
  }

  const ext =
    file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/${bookingId}/payment.${ext}`

  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.PAYMENT_SCREENSHOTS)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) return { path: null, error: error.message }
  return { path, error: null }
}

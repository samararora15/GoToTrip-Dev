import { supabase } from '@/lib/supabaseClient'

async function invokeFunction(name, body) {
  if (!supabase) {
    return { ok: false, error: 'App is not connected to Supabase.' }
  }

  const { data, error } = await supabase.functions.invoke(name, { body })

  if (error) {
    return { ok: false, error: error.message }
  }
  if (data?.error) {
    return { ok: false, error: data.error, data }
  }
  return { ok: Boolean(data?.ok ?? true), data, error: null }
}

export async function sendContactForm({ name, email, message }) {
  return invokeFunction('contact-form', { name, email, message })
}

/** Admin verify payment — only booking email sent by the app. */
export async function sendBookingConfirmation(bookingId) {
  return invokeFunction('send-confirmation', { bookingId })
}

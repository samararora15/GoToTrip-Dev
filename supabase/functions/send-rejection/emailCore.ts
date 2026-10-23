import { createClient } from "jsr:@supabase/supabase-js@2"

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

export function getAdminClient() {
  const url = Deno.env.get("SUPABASE_URL")!
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  return createClient(url, key)
}

export function getAuthedUserClient(authHeader: string | null) {
  const url = Deno.env.get("SUPABASE_URL")!
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!
  return createClient(url, anon, {
    global: { headers: { Authorization: authHeader ?? "" } },
  })
}

export function buildDedupedRecipients(bookerEmail: string, travelerEmails: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  const add = (email: string) => {
    const key = String(email ?? "").trim().toLowerCase()
    if (!key || !key.includes("@") || seen.has(key)) return
    seen.add(key)
    out.push(String(email).trim())
  }
  add(bookerEmail)
  for (const e of travelerEmails) add(e)
  return out
}

export async function loadBookingBundle(admin: ReturnType<typeof getAdminClient>, bookingId: string) {
  const { data: booking, error } = await admin
    .from("bookings")
    .select(
      `
      id,
      booking_number,
      user_id,
      traveler_count,
      total_amount,
      status,
      trips ( title, destination, starting_location, cancellation_policy, duration_days ),
      trip_dates ( departure_date, return_date ),
      travelers ( full_name, email, contact_number, age, gender )
    `,
    )
    .eq("id", bookingId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!booking) throw new Error("Booking not found")

  const { data: profile } = await admin
    .from("profiles")
    .select("email, name")
    .eq("id", booking.user_id)
    .maybeSingle()

  return { ...booking, profiles: profile }
}

export function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export async function sendResendEmail(to: string, subject: string, text: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY")
  const from = Deno.env.get("RESEND_FROM") ?? "GoToTrip <onboarding@resend.dev>"
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(detail || "Resend request failed")
  }

  const payload = await res.json()
  return payload.id as string | undefined
}

export async function logNotification(
  admin: ReturnType<typeof getAdminClient>,
  row: {
    booking_id: string
    type: string
    recipient_email: string
    status: "sent" | "failed"
    resend_message_id?: string | null
    error_message?: string | null
  },
) {
  await admin.from("notifications").insert({
    ...row,
    sent_at: new Date().toISOString(),
  })
}

export async function isAdminUser(admin: ReturnType<typeof getAdminClient>, userId: string) {
  const { data } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle()
  return data?.role === "admin"
}

export async function sendToRecipients(
  admin: ReturnType<typeof getAdminClient>,
  opts: {
    bookingId: string
    type: string
    recipients: string[]
    subject: string
    buildBody: () => string
  },
) {
  const results: { email: string; ok: boolean; error?: string }[] = []

  for (const email of opts.recipients) {
    try {
      const text = opts.buildBody()
      const messageId = await sendResendEmail(email, opts.subject, text)
      await logNotification(admin, {
        booking_id: opts.bookingId,
        type: opts.type,
        recipient_email: email,
        status: "sent",
        resend_message_id: messageId ?? null,
      })
      results.push({ email, ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Send failed"
      await logNotification(admin, {
        booking_id: opts.bookingId,
        type: opts.type,
        recipient_email: email,
        status: "failed",
        error_message: message,
      })
      results.push({ email, ok: false, error: message })
    }
  }

  return results
}

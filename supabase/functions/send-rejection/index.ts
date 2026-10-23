import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {
  buildDedupedRecipients,
  corsHeaders,
  getAdminClient,
  getAuthedUserClient,
  isAdminUser,
  jsonResponse,
  loadBookingBundle,
  sendToRecipients,
} from "./emailCore.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  try {
    const authHeader = req.headers.get("Authorization")
    const userClient = getAuthedUserClient(authHeader)
    const { data: authData, error: authError } = await userClient.auth.getUser()
    if (authError || !authData.user) {
      return jsonResponse({ error: "Unauthorized" }, 401)
    }

    const admin = getAdminClient()
    if (!(await isAdminUser(admin, authData.user.id))) {
      return jsonResponse({ error: "Forbidden" }, 403)
    }

    const body = await req.json()
    const bookingId = String(body?.bookingId ?? "")
    const note = String(body?.note ?? "").trim()
    if (!bookingId) return jsonResponse({ error: "bookingId is required" }, 400)

    const booking = await loadBookingBundle(admin, bookingId)
    const profile = booking.profiles as { email: string; name: string | null }
    const travelers = (booking.travelers ?? []) as { email: string }[]

    const recipients = buildDedupedRecipients(
      profile?.email || "",
      travelers.map((t) => t.email).filter(Boolean),
    )
    if (!recipients.length) {
      return jsonResponse({ error: "No recipient email on file" }, 400)
    }

    const supportEmail = Deno.env.get("CONTACT_INBOX") ?? "hello@gototrip.example"

    const results = await sendToRecipients(admin, {
      bookingId,
      type: "rejection",
      recipients,
      subject: `GoToTrip — payment could not be verified (${booking.booking_number})`,
      buildBody: () =>
        [
          `Hi${profile?.name ? ` ${profile.name}` : ""},`,
          "",
          `We could not verify the UPI payment for booking ${booking.booking_number}.`,
          "This can happen if the screenshot is unclear or the amount does not match.",
          note ? `\nNote from our team: ${note}\n` : "",
          "Please submit a new booking with a clear payment screenshot, or contact us for help.",
          "",
          supportEmail,
          "",
          "— GoToTrip",
        ]
          .filter(Boolean)
          .join("\n"),
    })

    const anySent = results.some((r) => r.ok)
    return jsonResponse({ ok: anySent, results })
  } catch (err) {
    console.error(err)
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    )
  }
})

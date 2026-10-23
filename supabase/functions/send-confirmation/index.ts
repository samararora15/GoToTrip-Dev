import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {
  buildDedupedRecipients,
  corsHeaders,
  formatDate,
  formatInr,
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
    if (!bookingId) return jsonResponse({ error: "bookingId is required" }, 400)

    const booking = await loadBookingBundle(admin, bookingId)
    if (booking.status !== "confirmed") {
      return jsonResponse({ error: "Booking is not confirmed" }, 400)
    }
    const trip = booking.trips as {
      title: string
      destination: string
      starting_location: string
      cancellation_policy: string | null
    }
    const tripDate = booking.trip_dates as { departure_date: string; return_date: string }
    const profile = booking.profiles as { email: string; name: string | null }
    const travelers = (booking.travelers ?? []) as {
      full_name: string
      email: string
      contact_number: string
    }[]

    const bookerEmail = profile?.email || ""
    const recipients = buildDedupedRecipients(
      bookerEmail,
      travelers.map((t) => t.email).filter(Boolean),
    )
    if (!recipients.length) {
      return jsonResponse({ error: "No recipient email on file" }, 400)
    }

    const travelerLines = travelers
      .map((t) => `- ${t.full_name} (${t.contact_number})${t.email ? ` · ${t.email}` : ""}`)
      .join("\n")

    const supportEmail = Deno.env.get("CONTACT_INBOX") ?? "hello@gototrip.example"
    const supportPhone = Deno.env.get("SUPPORT_PHONE") ?? ""

    const results = await sendToRecipients(admin, {
      bookingId,
      type: "confirmation",
      recipients,
      subject: `GoToTrip — booking confirmed (${booking.booking_number})`,
      buildBody: () =>
        [
          "Your booking is confirmed!",
          "",
          `Booking reference: ${booking.booking_number}`,
          `Trip: ${trip.title}`,
          `Destination: ${trip.destination}`,
          `Departure: ${formatDate(tripDate.departure_date)}`,
          `Return: ${formatDate(tripDate.return_date)}`,
          `Pickup / starting point: ${trip.starting_location}`,
          "",
          "Travelers:",
          travelerLines,
          "",
          `Amount paid: ${formatInr(Number(booking.total_amount))}`,
          "",
          "Important:",
          "- Carry a valid photo ID for each traveler.",
          "- Arrive at the meeting point on time; details may be shared closer to departure.",
          "",
          trip.cancellation_policy
            ? `Cancellation (summary): ${trip.cancellation_policy}`
            : "",
          "",
          "Support:",
          supportEmail,
          supportPhone,
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

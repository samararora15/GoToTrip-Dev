import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {
  buildDedupedRecipients,
  corsHeaders,
  formatDate,
  formatInr,
  getAdminClient,
  getAuthedUserClient,
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

    const body = await req.json()
    const bookingId = String(body?.bookingId ?? "")
    if (!bookingId) return jsonResponse({ error: "bookingId is required" }, 400)

    const admin = getAdminClient()
    const booking = await loadBookingBundle(admin, bookingId)

    if (booking.user_id !== authData.user.id) {
      return jsonResponse({ error: "Forbidden" }, 403)
    }

    const trip = booking.trips as { title: string; destination: string; starting_location: string }
    const tripDate = booking.trip_dates as { departure_date: string; return_date: string }
    const profile = booking.profiles as { email: string; name: string | null }
    const travelers = (booking.travelers ?? []) as { full_name: string; email: string }[]

    const bookerEmail = profile?.email || authData.user.email || ""
    const recipients = buildDedupedRecipients(bookerEmail, [])

    if (!recipients.length) {
      return jsonResponse({ error: "No recipient email on file" }, 400)
    }

    const travelerNames = travelers.map((t) => t.full_name).join(", ")
    const upiId = Deno.env.get("PUBLIC_UPI_ID") ?? ""

    const results = await sendToRecipients(admin, {
      bookingId,
      type: "acknowledgement",
      recipients,
      subject: `GoToTrip — booking received (${booking.booking_number})`,
      buildBody: () =>
        [
          `Hi${profile?.name ? ` ${profile.name}` : ""},`,
          "",
          "We received your booking and payment screenshot.",
          "",
          `Booking reference: ${booking.booking_number}`,
          `Trip: ${trip.title}`,
          `Destination: ${trip.destination}`,
          `Departure: ${formatDate(tripDate.departure_date)}`,
          `Return: ${formatDate(tripDate.return_date)}`,
          `Travelers (${booking.traveler_count}): ${travelerNames}`,
          `Total amount: ${formatInr(Number(booking.total_amount))}`,
          "",
          upiId ? `UPI ID used for payment: ${upiId}` : "",
          "Our team will verify your payment manually.",
          "You will receive a confirmation email after verification.",
          "",
          "Questions? Reply to this email or contact us via the website.",
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

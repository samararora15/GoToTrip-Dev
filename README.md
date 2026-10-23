# GoToTrip — Lucknow Travel Booking (V1)

React + Vite frontend for curated group trips from Lucknow. Backend: Supabase (Auth, Postgres, Storage, Edge Functions). Payments: manual UPI + screenshot verification.

## Phase 5 — booking flow

Logged-in checkout at `/checkout/:tripId` — four steps: departure & traveler count → traveler details → review → UPI + screenshot → `/booking/submitted`.

**`.env` for checkout:**

| Variable | Purpose |
|----------|---------|
| `VITE_UPI_ID` | Shown to customer (you already have this) |
| `VITE_UPI_QR_IMAGE_URL` | Optional full URL to a QR image (host in Storage or any HTTPS URL) |

**Test:** Book a trip → pay (test UPI) → upload screenshot → note booking reference `LKO-…` in Supabase `bookings` / `travelers` / `payments` and Storage `payment-screenshots/{user_id}/{booking_id}/`.

No booking email is sent on submit — customers see status in the app (**My bookings**). The only transactional booking email is **confirmation**, sent when an admin clicks **Verify payment**.

## Phase 6 — confirmation email (Resend)

**`send-confirmation`** Edge Function (JWT, admin only) runs when payment is verified in `/admin/bookings`. Contact form still uses **`contact-form`**.

**Supabase → Project Settings → Edge Functions → Secrets:**

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Verified sender (e.g. `GoToTrip <onboarding@resend.dev>` until domain verified) |
| `CONTACT_INBOX` | Support line in confirmation email body |
| `SUPPORT_PHONE` | Optional; shown on confirmation emails |

Sends are logged in **`notifications`**. If Resend fails after verify, the booking stays **confirmed**; admin sees a warning in the UI.

**Redeploy** (after editing `supabase/functions/send-confirmation`):

```bash
node scripts/deploy-edge-functions.mjs
```

**Test:** Admin → verify a pending booking → inbox “booking confirmed” → `notifications` row with `type = confirmation`.

## Email recipients (confirmation only)

When admin **verifies payment**:

1. **Always** email the **booker** (`profiles.email` / auth email).
2. **Also** email each **traveler** with an email on the booking form (optional field).
3. **Dedupe** addresses (case-insensitive).

## Phase 7 — customer dashboard

Logged-in customers use:

| Route | Purpose |
|-------|---------|
| `/dashboard` | Booking counts, next departure, recent bookings |
| `/my-bookings` | Full list with status and dates |
| `/booking/:id` | Reference, status, travelers, payment + screenshot preview |
| `/profile` | Edit **name** and **phone** (email is read-only login) |

**Try locally**

1. Sign in → `/dashboard` — stats after at least one booking.
2. `/my-bookings` — cards link to detail.
3. Complete checkout → **View booking** on submitted page → screenshot preview (signed URL).
4. `/profile` — save name/phone; new checkout pre-fills traveler 1 from profile.

Data is scoped by RLS (`bookings.user_id = auth.uid()`). If a trip is later unpublished, detail may hide trip copy but booking reference and status remain.

## Phase 8 — admin

Requires **`profiles.role = admin`** (Studio or migration). Routes:

| Route | Purpose |
|-------|---------|
| `/admin` | Metrics: pending bookings, confirmed, published trips |
| `/admin/bookings` | List/filter bookings, view screenshot, **Verify payment** / **Reject** |
| `/admin/trips` | Trip list, publish/draft/archive, edit link |
| `/admin/trips/new`, `/admin/trips/:id/edit` | Create/edit trip copy, pricing, status |

**Verify payment:** sets booking `confirmed`, payment `verified`, reduces `trip_dates.available_seats`, then calls `send-confirmation` (email failure is shown but does **not** roll back confirmation).

**Reject:** sets booking/payment rejected, optional note on booking (visible in customer **My bookings**). No email is sent.

Trip **dates** and **cover images** are still easiest in Supabase Studio for V1; admin UI focuses on trip fields and status.

## Phase 4 — authentication

Email/password sign-in and registration, session in `AuthContext`, protected routes for checkout, customer pages, and admin.

**Try locally**

1. `/signup` — create account (name, email, password).
2. `/login` — sign in; after login you return to the page you tried to open (e.g. checkout).
3. **Book this trip** while logged out → redirects to login → back to checkout after sign-in.
4. **Log out** from the navbar.

**Supabase Auth settings** (Dashboard → **Authentication → Providers → Email**)

- Enabled (default). If **Confirm email** is on, signup shows “Check your email” until the user confirms.

**Admin role:** still manual — Table Editor → `profiles` → set `role` to `admin` for your user, then **hard refresh** the site (Ctrl+Shift+R). Admin users see **Admin** in the navbar and can open `/admin/*`. (If role snaps back to `customer`, the DB trigger fix in migration `20260320100005_fix_profile_role_trigger.sql` must be applied — Studio edits run without a logged-in JWT.)

Protected routes: `/checkout/*`, `/booking/*`, `/dashboard`, `/my-bookings`, `/profile`, `/admin/*`.

## Phase 3 — public website

Run `npm.cmd run dev` and browse `/`, `/trips`, `/trips/manali-solang-valley`, policy pages, and `/contact`.

**Contact form (Resend):** Deploy the `contact-form` Edge Function, then in Supabase → **Project Settings → Edge Functions → Secrets**:

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `CONTACT_INBOX` | Your inbox (e.g. your Gmail) |
| `RESEND_FROM` | Verified sender in Resend (until domain verified, use `onboarding@resend.dev`) |

Without `RESEND_API_KEY`, the form validates but returns a friendly “not configured” message.

## Phase 2 — database

Migrations live in `supabase/migrations/` and are applied to the linked Supabase project.

**Verify in Supabase Studio → Table Editor:** `trips` (3 rows), `trip_dates` (6), `trip_images` (3).

**Seed cover photos:** Storage → `trip-images` → upload to folder `seed/`:

- `manali-cover.jpg`
- `kedarnath-cover.jpg`
- `goa-cover.jpg`

(Phase 3 trip cards use these paths; until uploaded, covers may 404.)

**Make yourself admin (after signup in Phase 4):** Table Editor → `profiles` → set `role` to `admin`.

## Managing trips (Supabase Studio)

Until **Phase 8** (`/admin/trips`), add and edit trips in **[Supabase Dashboard](https://supabase.com/dashboard) → Table Editor** (and **Storage** for photos). Changes appear on the live site after a browser refresh — no frontend redeploy.

### Add a new trip

1. **Table Editor → `trips` → Insert row**

   | Field | Notes |
   |-------|--------|
   | `title` | Display name |
   | `slug` | Unique URL segment, e.g. `manali-winter-2026` → `/trips/manali-winter-2026` |
   | `destination`, `starting_location` | Usually `Lucknow` for departures |
   | `duration_days`, `price_per_person`, `capacity` | Required numbers |
   | `status` | `published` = visible on site; `draft` = hidden |
   | `featured` | `true` to highlight on homepage |
   | `description`, `inclusions`, `exclusions`, `accommodation`, `transportation`, `meals`, `cancellation_policy` | Arrays for inclusions/exclusions |

2. **Table Editor → `trip_images` → Insert row**

   - `trip_id` — UUID from the trip you created  
   - `storage_path` — path inside bucket `trip-images`, e.g. `seed/my-trip-cover.jpg`  
   - `is_cover` — `true` for the main card/detail hero  
   - `display_order` — `0` for cover; higher for gallery order  
   - `alt_text` — accessibility / SEO  

   Upload the file first: **Storage → trip-images** → create a folder if needed → upload image. Path in DB must match object path (folder + filename, no leading slash).

3. **Table Editor → `trip_dates` → Insert row(s)**

   - `trip_id`, `departure_date`, `return_date`, `available_seats`  
   - `status` — `open` (bookable), `full`, or `cancelled`  

**Rough effort:** ~5–10 minutes per trip if copy and images are ready.

### Update an existing trip

- **Table Editor → `trips`** → open the row → edit fields → Save.  
- Edit dates in **`trip_dates`**, images in **`trip_images`**, or replace files in **Storage** (keep `storage_path` in sync if you rename/move files).

### Hide a trip from the website (temporary)

Prefer **status** over deleting data:

| `trips.status` | Public site |
|----------------|-------------|
| `published` | Listed on `/trips` and detail pages |
| `draft` | Hidden (RLS: anon/authenticated cannot read) |
| `archived` | Hidden (same as draft for visitors) |

Set **`draft`** or **`archived`** to unpublish; set back to **`published`** when ready.

**Hide one departure only:** in **`trip_dates`**, set that row’s `status` to `cancelled` or `full` — the trip stays live, that date drops off bookable lists.

### Delete a trip permanently

Delete the row in **`trips`**. Related **`trip_images`** and **`trip_dates`** rows are removed (FK cascade). Optionally delete orphaned files in **Storage → trip-images**. Use only when you do not need history.

### Admin UI (planned)

**Phase 8** adds `/admin/trips`: create/edit, publish/unpublish, images, and dates in the web app. Until then, Studio is the source of truth.

## Quality checks

```bash
npm.cmd run build
node scripts/smoke-test-app.mjs
# Optional (logged-in): set SMOKE_EMAIL and SMOKE_PASSWORD, then re-run smoke test
```

### Known limitations (V1)

- **Seats:** Pending bookings do not hold seats; multiple pending requests can exceed capacity until admin verifies. Verify checks `available_seats` before confirming.
- **Overbooking:** Admin must reject extras or add capacity in Studio (`trip_dates.available_seats`).
- **Trip dates / images:** Admin UI edits trip metadata; dates and Storage images are still managed in Supabase Studio.
- **Emails:** Only **confirmation** on admin verify (plus contact form). No email on book or reject.
- **Security:** `is_admin()` is callable via PostgREST for RLS; tightening requires policy refactors (see Supabase advisor).

## Phase 1 — local setup

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key when ready
npm run dev
```

**Windows PowerShell:** If `npm` fails with *running scripts is disabled*, use the `.cmd` shim (no policy change):

```powershell
npm.cmd install
npm.cmd run dev
```

Or allow scripts for your user only (one time):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Open [http://localhost:5173](http://localhost:5173). All routes from the implementation plan are wired; features fill in phase by phase.

## Stack

- React (JavaScript) + Vite
- Tailwind CSS v4 + shadcn-style UI primitives
- React Router, React Hook Form + Zod
- Supabase client (`src/lib/supabaseClient.js`)

## Environment

See `.env.example`. Never commit `.env`.

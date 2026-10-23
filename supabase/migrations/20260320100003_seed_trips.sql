-- GoToTrip Phase 2: sample published trips, dates, and image metadata
-- Cover files live at trip-images/seed/*.jpg (upload via dashboard or Phase 8 admin).

INSERT INTO public.trips (
  title,
  slug,
  description,
  destination,
  starting_location,
  duration_days,
  price_per_person,
  capacity,
  featured,
  status,
  inclusions,
  exclusions,
  accommodation,
  transportation,
  meals,
  cancellation_policy
)
VALUES
  (
    'Manali & Solang Valley',
    'manali-solang-valley',
    'A crisp Himalayan escape from Lucknow — snow views, mall road evenings, and a guided Solang day trip with time to breathe.',
    'Manali, Himachal Pradesh',
    'Lucknow',
    5,
    12999,
    30,
    true,
    'published',
    ARRAY['AC tempo traveller', '4 nights hotel stay', 'Breakfast & dinner', 'Solang Valley day trip', 'Trip captain'],
    ARRAY['Personal expenses', 'Adventure sports charges', 'Lunches on travel days'],
    '3-star hotel on triple sharing. Double sharing available at supplement.',
    'AC tempo traveller from Lucknow and back.',
    'Breakfast and dinner included at hotel.',
    '50% refund if cancelled 15+ days before departure. No refund within 7 days.'
  ),
  (
    'Kedarnath Yatra (Heli option)',
    'kedarnath-yatra',
    'A thoughtfully paced pilgrimage — road to Sonprayag, trek or pony support, and darshan time without rushing the mountain.',
    'Kedarnath, Uttarakhand',
    'Lucknow',
    6,
    18999,
    25,
    true,
    'published',
    ARRAY['Transport from Lucknow', 'Guptkashi stay', 'Meals as per itinerary', 'Local support team', 'Medical kit'],
    ARRAY['Helicopter tickets', 'Pony/palki charges', 'Temple donations'],
    'Guest house / basic hotel on sharing basis.',
    'AC bus to Uttarakhand and local jeeps as per route.',
    'Vegetarian meals on yatra route.',
    'Non-refundable within 10 days of departure due to permit blocks.'
  ),
  (
    'Goa Monsoon Getaway',
    'goa-monsoon-getaway',
    'Rain-washed beaches, quiet lanes, and seafood nights — Goa without the peak-season crush.',
    'North Goa',
    'Lucknow',
    4,
    11499,
    28,
    false,
    'published',
    ARRAY['Flights ex-Lucknow (group fare)', '3 nights stay', 'Airport transfers', 'One North Goa sightseeing day'],
    ARRAY['Meals not mentioned', 'Watersports', 'Travel insurance'],
    'Boutique stay near Calangute on double sharing.',
    'Group flight + local AC vehicle for sightseeing.',
    'Breakfast only.',
    'Airline fare rules apply; land package 40% refund before 12 days.'
  );

INSERT INTO public.trip_images (trip_id, storage_path, alt_text, display_order, is_cover)
SELECT t.id, 'seed/manali-cover.jpg', 'Snow-capped peaks above Manali valley', 0, true
FROM public.trips t WHERE t.slug = 'manali-solang-valley';

INSERT INTO public.trip_images (trip_id, storage_path, alt_text, display_order, is_cover)
SELECT t.id, 'seed/kedarnath-cover.jpg', 'Kedarnath temple against mountain backdrop', 0, true
FROM public.trips t WHERE t.slug = 'kedarnath-yatra';

INSERT INTO public.trip_images (trip_id, storage_path, alt_text, display_order, is_cover)
SELECT t.id, 'seed/goa-cover.jpg', 'Palm-lined Goa beach at dusk', 0, true
FROM public.trips t WHERE t.slug = 'goa-monsoon-getaway';

INSERT INTO public.trip_dates (trip_id, departure_date, return_date, available_seats, status)
SELECT t.id, d.departure_date, d.return_date, d.available_seats, 'open'
FROM public.trips t
JOIN (
  VALUES
    ('manali-solang-valley', DATE '2026-04-10', DATE '2026-04-14', 18),
    ('manali-solang-valley', DATE '2026-05-08', DATE '2026-05-12', 22),
    ('kedarnath-yatra', DATE '2026-05-15', DATE '2026-05-20', 20),
    ('kedarnath-yatra', DATE '2026-06-05', DATE '2026-06-10', 16),
    ('goa-monsoon-getaway', DATE '2026-07-03', DATE '2026-07-06', 24),
    ('goa-monsoon-getaway', DATE '2026-08-14', DATE '2026-08-17', 20)
) AS d (slug, departure_date, return_date, available_seats)
  ON t.slug = d.slug;

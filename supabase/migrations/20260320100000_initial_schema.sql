-- GoToTrip Phase 2: core schema

CREATE SEQUENCE IF NOT EXISTS public.booking_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name text,
  email text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  destination text NOT NULL,
  starting_location text NOT NULL DEFAULT 'Lucknow',
  duration_days integer NOT NULL CHECK (duration_days > 0),
  price_per_person numeric(10, 2) NOT NULL CHECK (price_per_person >= 0),
  capacity integer NOT NULL CHECK (capacity > 0),
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  inclusions text[] NOT NULL DEFAULT '{}',
  exclusions text[] NOT NULL DEFAULT '{}',
  accommodation text,
  transportation text,
  meals text,
  cancellation_policy text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.trip_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  alt_text text,
  display_order integer NOT NULL DEFAULT 0,
  is_cover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trip_images_trip_id_idx ON public.trip_images (trip_id);

CREATE TABLE public.trip_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips (id) ON DELETE CASCADE,
  departure_date date NOT NULL,
  return_date date NOT NULL,
  available_seats integer NOT NULL CHECK (available_seats >= 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (return_date >= departure_date)
);

CREATE INDEX trip_dates_trip_id_idx ON public.trip_dates (trip_id);
CREATE INDEX trip_dates_departure_date_idx ON public.trip_dates (departure_date);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE RESTRICT,
  trip_id uuid NOT NULL REFERENCES public.trips (id) ON DELETE RESTRICT,
  trip_date_id uuid NOT NULL REFERENCES public.trip_dates (id) ON DELETE RESTRICT,
  traveler_count integer NOT NULL CHECK (traveler_count > 0),
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'payment_pending'
    CHECK (status IN ('payment_pending', 'confirmed', 'rejected', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX bookings_user_id_idx ON public.bookings (user_id);
CREATE INDEX bookings_status_idx ON public.bookings (status);

CREATE TABLE public.travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 1),
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  contact_number text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX travelers_booking_id_idx ON public.travelers (booking_id);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings (id) ON DELETE CASCADE,
  upi_id_shown text,
  screenshot_path text,
  verified_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'rejected')),
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings (id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('acknowledgement', 'confirmation', 'rejection')),
  recipient_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_message_id text,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_booking_id_idx ON public.notifications (booking_id);

CREATE OR REPLACE FUNCTION public.set_booking_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number :=
      'LKO-'
      || EXTRACT(YEAR FROM now())::text
      || '-'
      || lpad(nextval('public.booking_number_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_set_booking_number
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.set_booking_number();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'customer'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- GoToTrip Phase 2: RLS helpers and policies

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_admin() AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_protect_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own_or_admin
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update_own_or_admin
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (id = auth.uid() OR public.is_admin());

-- trips
CREATE POLICY trips_select_published_or_admin
ON public.trips
FOR SELECT
TO anon, authenticated
USING (status = 'published' OR public.is_admin());

CREATE POLICY trips_insert_admin
ON public.trips
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY trips_update_admin
ON public.trips
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY trips_delete_admin
ON public.trips
FOR DELETE
TO authenticated
USING (public.is_admin());

-- trip_images
CREATE POLICY trip_images_select_published_or_admin
ON public.trip_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.trips t
    WHERE t.id = trip_id
      AND (t.status = 'published' OR public.is_admin())
  )
);

CREATE POLICY trip_images_insert_admin
ON public.trip_images
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY trip_images_update_admin
ON public.trip_images
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY trip_images_delete_admin
ON public.trip_images
FOR DELETE
TO authenticated
USING (public.is_admin());

-- trip_dates
CREATE POLICY trip_dates_select_published_or_admin
ON public.trip_dates
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.trips t
    WHERE t.id = trip_id
      AND (t.status = 'published' OR public.is_admin())
  )
);

CREATE POLICY trip_dates_insert_admin
ON public.trip_dates
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY trip_dates_update_admin
ON public.trip_dates
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY trip_dates_delete_admin
ON public.trip_dates
FOR DELETE
TO authenticated
USING (public.is_admin());

-- bookings
CREATE POLICY bookings_select_own_or_admin
ON public.bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY bookings_insert_own
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY bookings_update_admin
ON public.bookings
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- travelers
CREATE POLICY travelers_select_own_or_admin
ON public.travelers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND (b.user_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY travelers_insert_own_booking
ON public.travelers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status = 'payment_pending'
  )
);

CREATE POLICY travelers_update_own_or_admin
ON public.travelers
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status = 'payment_pending'
  )
)
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status = 'payment_pending'
  )
);

-- payments
CREATE POLICY payments_select_own_or_admin
ON public.payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND (b.user_id = auth.uid() OR public.is_admin())
  )
);

CREATE POLICY payments_insert_own_booking
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.id = booking_id
      AND b.user_id = auth.uid()
      AND b.status = 'payment_pending'
  )
);

CREATE POLICY payments_update_admin
ON public.payments
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- notifications (admin read; writes via service role in Edge Functions)
CREATE POLICY notifications_select_admin
ON public.notifications
FOR SELECT
TO authenticated
USING (public.is_admin());

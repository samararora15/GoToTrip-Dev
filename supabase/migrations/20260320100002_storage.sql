-- GoToTrip Phase 2: storage buckets and policies

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-images',
  'trip-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY trip_images_public_read
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'trip-images');

CREATE POLICY trip_images_admin_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'trip-images' AND public.is_admin());

CREATE POLICY trip_images_admin_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'trip-images' AND public.is_admin())
WITH CHECK (bucket_id = 'trip-images' AND public.is_admin());

CREATE POLICY trip_images_admin_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'trip-images' AND public.is_admin());

CREATE POLICY payment_screenshots_insert_own
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY payment_screenshots_select_own_or_admin
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND (
    public.is_admin()
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

CREATE POLICY payment_screenshots_update_own
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'payment-screenshots'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY payment_screenshots_delete_admin
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.is_admin());

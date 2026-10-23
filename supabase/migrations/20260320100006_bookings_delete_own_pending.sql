-- Allow rollback of failed checkout (travelers/upload errors) for payment_pending bookings.

CREATE POLICY bookings_delete_own_pending
ON public.bookings
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  AND status = 'payment_pending'
);

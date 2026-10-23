-- NOTE: is_admin() is invoked from RLS policies for anon/authenticated roles.
-- Revoking EXECUTE breaks public trip reads. Supabase may warn about RPC exposure;
-- acceptable for V1 until policies are refactored to avoid is_admin() on anon paths.

-- Intentionally no-op in fresh installs (grants remain from 20260320100001).
SELECT 1;

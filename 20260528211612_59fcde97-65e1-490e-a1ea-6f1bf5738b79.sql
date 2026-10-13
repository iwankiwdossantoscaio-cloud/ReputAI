
-- 1. Restrict companies SELECT to non-sensitive columns via column privileges
-- Drop broad SELECT policy and replace with one that requires authentication but
-- rely on column grants to hide sensitive fields from non-admins.
DROP POLICY IF EXISTS "Authenticated read companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated insert companies" ON public.companies;

-- Admins can read everything (already covered by "Admins manage companies" ALL policy)
-- Authenticated users read all rows but only non-sensitive columns (enforced via grants)
CREATE POLICY "Authenticated read companies"
ON public.companies FOR SELECT
TO authenticated
USING (true);

-- Restrict INSERT to admins only to prevent dataset pollution
CREATE POLICY "Admins insert companies"
ON public.companies FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Revoke column-level access to sensitive fields from authenticated; admins use ALL policy
REVOKE SELECT ON public.companies FROM authenticated;
GRANT SELECT (id, name, sector, location, lat, lng, description, website, average_rating, review_count, created_at)
  ON public.companies TO authenticated;
GRANT SELECT ON public.companies TO service_role;

-- 2. Enforce status='pending' on evaluation INSERT
DROP POLICY IF EXISTS "Auth users insert evals" ON public.evaluations;
CREATE POLICY "Auth users insert evals"
ON public.evaluations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

ALTER TABLE public.evaluations
  DROP CONSTRAINT IF EXISTS evaluations_status_check;
ALTER TABLE public.evaluations
  ADD CONSTRAINT evaluations_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- 3. Remove evaluation_comments and evaluation_likes from realtime publication
-- to avoid unrestricted realtime subscriptions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'evaluation_comments'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.evaluation_comments';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'evaluation_likes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.evaluation_likes';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'evaluations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.evaluations';
  END IF;
END $$;

-- 4. Explicit INSERT policy on profiles (owner-only)
CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Explicit restrictive INSERT policy on user_roles (admins only; trigger uses SECURITY DEFINER and bypasses RLS)
CREATE POLICY "Only admins insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());


-- 1. Fix profiles: restrict SELECT to authenticated users only (remove public access to CPF/email/birth_date)
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

CREATE POLICY "Authenticated users read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Create a secure view that hides user_id from anonymous evaluations for non-admins
CREATE OR REPLACE FUNCTION public.get_evaluation_display_name(ev_user_name text, ev_anonymous boolean, ev_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN ev_anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN 'Anônimo'
    ELSE ev_user_name
  END
$$;

CREATE OR REPLACE FUNCTION public.get_evaluation_user_id(ev_anonymous boolean, ev_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN ev_anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN NULL
    ELSE ev_user_id
  END
$$;

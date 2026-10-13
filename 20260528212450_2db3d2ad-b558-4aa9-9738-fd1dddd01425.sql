-- Allow public (anon + authenticated) to read non-sensitive company fields
-- Sensitive fields (cnpj, email, phone) remain admin-only via existing "Admins manage companies" ALL policy

-- Drop the restrictive authenticated-only select policy
DROP POLICY IF EXISTS "Authenticated read companies" ON public.companies;

-- Allow everyone to read companies rows (sensitive columns gated by column grants)
CREATE POLICY "Anyone reads companies"
ON public.companies FOR SELECT
TO anon, authenticated
USING (true);

-- Revoke broad SELECT and re-grant only non-sensitive columns to anon/authenticated
REVOKE SELECT ON public.companies FROM anon, authenticated;
GRANT SELECT (id, name, sector, location, lat, lng, description, website, average_rating, review_count, created_at)
  ON public.companies TO anon, authenticated;
GRANT ALL ON public.companies TO service_role;

-- Ensure evaluations RPC is callable by anon as well (it's SECURITY DEFINER and only returns approved)
GRANT EXECUTE ON FUNCTION public.get_public_evaluations() TO anon, authenticated;
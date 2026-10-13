
-- Fix 1: Change profiles UPDATE policy from 'public' to 'authenticated'
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix 2: Create a secure view for evaluations that masks user_id for anonymous reviews
CREATE OR REPLACE VIEW public.safe_evaluations AS
SELECT
  id,
  company_id,
  CASE WHEN anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN NULL ELSE user_id END AS user_id,
  CASE WHEN anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN 'Anônimo' ELSE user_name END AS user_name,
  rating,
  text,
  date,
  ambient,
  benefits,
  salary_amount,
  salary_period,
  anonymous,
  status,
  flagged_profanity,
  aviso_aceito,
  termos_aceitos_em,
  created_at
FROM public.evaluations;

-- Fix 3: Restrict company sensitive data - remove public SELECT, add authenticated SELECT
DROP POLICY IF EXISTS "Anyone can read companies" ON public.companies;

-- Public can read only non-sensitive columns via a view
CREATE OR REPLACE VIEW public.public_companies AS
SELECT
  id, name, description, location, sector, lat, lng,
  average_rating, review_count, created_at, website
FROM public.companies;

-- Only authenticated users can read full company data
CREATE POLICY "Authenticated read companies"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (true);

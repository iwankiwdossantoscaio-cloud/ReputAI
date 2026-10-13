
-- Fix views to use SECURITY INVOKER
CREATE OR REPLACE VIEW public.safe_evaluations
WITH (security_invoker = on) AS
SELECT
  id,
  company_id,
  CASE WHEN anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN NULL::uuid ELSE user_id END AS user_id,
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

CREATE OR REPLACE VIEW public.public_companies
WITH (security_invoker = on) AS
SELECT
  id, name, description, location, sector, lat, lng,
  average_rating, review_count, created_at, website
FROM public.companies;

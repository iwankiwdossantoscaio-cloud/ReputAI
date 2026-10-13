
-- Drop the view since we'll use an RPC instead
DROP VIEW IF EXISTS public.safe_evaluations;

-- Restrict evaluations SELECT - only own rows or admin can read directly
DROP POLICY IF EXISTS "Public reads approved evals" ON public.evaluations;

CREATE POLICY "Users read own or admin reads all"
  ON public.evaluations
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = user_id) OR is_admin());

-- Create RPC for public evaluation reading with masked user_id
CREATE OR REPLACE FUNCTION public.get_public_evaluations()
RETURNS TABLE(
  id uuid,
  company_id uuid,
  user_id uuid,
  user_name text,
  rating integer,
  text text,
  date text,
  ambient text,
  benefits text[],
  salary_amount text,
  salary_period text,
  anonymous boolean,
  status text,
  flagged_profanity boolean,
  aviso_aceito boolean,
  termos_aceitos_em text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    e.id,
    e.company_id,
    CASE WHEN e.anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN NULL::uuid ELSE e.user_id END,
    CASE WHEN e.anonymous AND NOT public.has_role(auth.uid(), 'admin') THEN 'Anônimo' ELSE e.user_name END,
    e.rating,
    e.text,
    e.date,
    e.ambient,
    e.benefits,
    e.salary_amount,
    e.salary_period,
    e.anonymous,
    e.status,
    e.flagged_profanity,
    e.aviso_aceito,
    e.termos_aceitos_em,
    e.created_at
  FROM public.evaluations e
  WHERE e.status = 'approved'
     OR e.user_id = auth.uid()
     OR public.has_role(auth.uid(), 'admin')
  ORDER BY e.created_at DESC;
$$;

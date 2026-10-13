-- =====================================================
-- Security hardening migration
-- =====================================================

-- 1. Perfis: CPF e data de nascimento nunca expostos a outros usuários
DROP POLICY IF EXISTS "Users read own profile or admin" ON public.profiles;
CREATE POLICY "Users read own profile or admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 2. CNPJ único (ignora vazios)
CREATE UNIQUE INDEX IF NOT EXISTS companies_cnpj_unique
  ON public.companies(cnpj)
  WHERE cnpj IS NOT NULL AND cnpj <> '';

-- 3. Uma avaliação aprovada/pendente por usuário por empresa
CREATE UNIQUE INDEX IF NOT EXISTS evaluations_one_per_user_company
  ON public.evaluations(user_id, company_id)
  WHERE status IN ('pending', 'approved');

-- 4. Limites de tamanho de texto
ALTER TABLE public.evaluations
  ADD CONSTRAINT IF NOT EXISTS evaluation_text_min CHECK (length(text) >= 10),
  ADD CONSTRAINT IF NOT EXISTS evaluation_text_max CHECK (length(text) <= 5000);

-- 5. Rating entre 1 e 5
ALTER TABLE public.evaluations
  ADD CONSTRAINT IF NOT EXISTS evaluation_rating_range CHECK (rating BETWEEN 1 AND 5);

-- 6. Limite de tamanho de comentários
ALTER TABLE public.evaluation_comments
  ADD CONSTRAINT IF NOT EXISTS comment_text_max CHECK (length(text) <= 1000),
  ADD CONSTRAINT IF NOT EXISTS comment_text_min CHECK (length(text) >= 1);

-- 7. Impede inserção de avaliação como outro usuário
CREATE OR REPLACE FUNCTION public.enforce_eval_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'user_id deve corresponder ao usuário autenticado';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_eval_user_id_trigger ON public.evaluations;
CREATE TRIGGER enforce_eval_user_id_trigger
  BEFORE INSERT ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_eval_user_id();

-- 8. Coordenadas geográficas válidas
ALTER TABLE public.companies
  ADD CONSTRAINT IF NOT EXISTS companies_lat_range CHECK (lat BETWEEN -90 AND 90),
  ADD CONSTRAINT IF NOT EXISTS companies_lng_range CHECK (lng BETWEEN -180 AND 180);

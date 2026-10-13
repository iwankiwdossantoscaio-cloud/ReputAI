
-- Comments on evaluations
CREATE TABLE public.evaluation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.evaluation_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads comments" ON public.evaluation_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users insert comments" ON public.evaluation_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own comments" ON public.evaluation_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Likes on evaluations
CREATE TABLE public.evaluation_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evaluation_id, user_id)
);

ALTER TABLE public.evaluation_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads likes" ON public.evaluation_likes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Auth users insert likes" ON public.evaluation_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own likes" ON public.evaluation_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Company additional fields
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS website TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cnpj TEXT DEFAULT '';

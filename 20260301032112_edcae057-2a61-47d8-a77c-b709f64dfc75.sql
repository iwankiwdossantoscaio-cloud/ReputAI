
-- Fix permissive INSERT policy on companies - only admins should create companies normally,
-- but authenticated users can also insert (for creating companies during evaluation)
DROP POLICY IF EXISTS "Authenticated insert companies" ON public.companies;
CREATE POLICY "Authenticated insert companies" ON public.companies 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

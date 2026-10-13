DROP POLICY IF EXISTS "Authenticated users read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

CREATE POLICY "Users read own profile or admin"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id OR is_admin());
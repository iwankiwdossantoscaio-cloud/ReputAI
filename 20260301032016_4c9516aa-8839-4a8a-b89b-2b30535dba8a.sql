
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  birth_date TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  average_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  text TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  aviso_aceito BOOLEAN NOT NULL DEFAULT false,
  termos_aceitos_em TEXT NOT NULL DEFAULT '',
  ambient TEXT DEFAULT '',
  benefits TEXT[] DEFAULT '{}',
  salary_amount TEXT DEFAULT '',
  salary_period TEXT DEFAULT '',
  anonymous BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  flagged_profanity BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Create evaluation_reports table
CREATE TABLE public.evaluation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(evaluation_id, user_id)
);
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'new_evaluation',
  title TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  evaluation_id UUID REFERENCES public.evaluations(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: is current user admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Trigger: auto-create profile on signup (from raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, cpf, birth_date, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'birth_date', ''),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', 'U'), 1))
  );
  -- Default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: create notification when new evaluation is inserted
CREATE OR REPLACE FUNCTION public.handle_new_evaluation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_name TEXT;
BEGIN
  SELECT name INTO company_name FROM public.companies WHERE id = NEW.company_id;
  INSERT INTO public.admin_notifications (type, title, message, evaluation_id)
  VALUES (
    CASE WHEN NEW.flagged_profanity THEN 'flagged_evaluation' ELSE 'new_evaluation' END,
    CASE WHEN NEW.flagged_profanity THEN 'Avaliação suspeita' ELSE 'Nova avaliação' END,
    'Avaliação para ' || COALESCE(company_name, 'empresa') || ' por ' || COALESCE(NEW.user_name, 'anônimo'),
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_evaluation_created
  AFTER INSERT ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_evaluation();

-- Trigger: recalculate company rating on evaluation status change
CREATE OR REPLACE FUNCTION public.recalc_company_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_company_id UUID;
  avg_r DOUBLE PRECISION;
  cnt INTEGER;
BEGIN
  target_company_id := COALESCE(NEW.company_id, OLD.company_id);
  SELECT COALESCE(AVG(rating), 0), COUNT(*) INTO avg_r, cnt
  FROM public.evaluations
  WHERE company_id = target_company_id AND status = 'approved';
  
  UPDATE public.companies
  SET average_rating = avg_r, review_count = cnt
  WHERE id = target_company_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_evaluation_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.evaluations
  FOR EACH ROW EXECUTE FUNCTION public.recalc_company_rating();

-- RLS Policies

-- profiles
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- companies
CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage companies" ON public.companies FOR ALL USING (public.is_admin());

-- evaluations
CREATE POLICY "Public reads approved evals" ON public.evaluations FOR SELECT USING (
  status = 'approved' OR auth.uid() = user_id OR public.is_admin()
);
CREATE POLICY "Auth users insert evals" ON public.evaluations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update evals" ON public.evaluations FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete evals" ON public.evaluations FOR DELETE USING (public.is_admin() OR auth.uid() = user_id);

-- evaluation_reports
CREATE POLICY "Auth users insert reports" ON public.evaluation_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read reports" ON public.evaluation_reports FOR SELECT USING (public.is_admin() OR auth.uid() = user_id);
CREATE POLICY "Admins manage reports" ON public.evaluation_reports FOR DELETE USING (public.is_admin());

-- admin_notifications
CREATE POLICY "Admins read notifications" ON public.admin_notifications FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update notifications" ON public.admin_notifications FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins delete notifications" ON public.admin_notifications FOR DELETE USING (public.is_admin());

-- Seed default companies
INSERT INTO public.companies (name, sector, location, lat, lng, description, average_rating, review_count) VALUES
  ('Magazine Luiza', 'Varejo', 'São Paulo, SP', -23.5505, -46.6333, 'Rede varejista brasileira', 4.2, 1245),
  ('Itaú Unibanco', 'Finanças', 'São Paulo, SP', -23.5500, -46.6390, 'Maior banco privado do Brasil', 3.9, 2341),
  ('Nubank', 'Finanças', 'São Paulo, SP', -23.5489, -46.6388, 'Fintech brasileira', 4.5, 1890),
  ('Petrobras', 'Energia', 'Rio de Janeiro, RJ', -22.9068, -43.1729, 'Empresa estatal de petróleo', 3.2, 3120);

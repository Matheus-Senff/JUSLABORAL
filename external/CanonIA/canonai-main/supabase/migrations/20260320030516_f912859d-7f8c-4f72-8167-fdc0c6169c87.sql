ALTER TABLE public.generation_history ADD COLUMN status text NOT NULL DEFAULT 'draft';

-- Add a profiles table for admin panel to show member names
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Org admins can read member profiles" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    AND EXISTS (
      SELECT 1 FROM public.organization_members om2
      WHERE om2.user_id = profiles.id AND om2.org_id = om.org_id
    )
  )
);

-- Allow org admins to read generation_history of their members
CREATE POLICY "Org admins can read member history" ON public.generation_history FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.user_id = auth.uid() AND om.role IN ('admin', 'owner')
    AND EXISTS (
      SELECT 1 FROM public.organization_members om2
      WHERE om2.user_id = generation_history.user_id AND om2.org_id = om.org_id
    )
  )
);

-- Organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Organization members
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Shared templates (org-level)
CREATE TABLE public.shared_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'geral',
  structure jsonb NOT NULL DEFAULT '{}'::jsonb,
  font_family text DEFAULT 'Times New Roman',
  font_size integer DEFAULT 12,
  margins jsonb DEFAULT '{"top": 3, "left": 3, "right": 2, "bottom": 2}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_templates ENABLE ROW LEVEL SECURITY;

-- Shared prompts (org-level)
CREATE TABLE public.shared_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_prompts ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of org
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Helper: check if org has business plan
CREATE OR REPLACE FUNCTION public.is_business_org(_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND plan IN ('business', 'enterprise', 'team')
  )
$$;

-- RLS: Organizations - members can read their own orgs
CREATE POLICY "Members can read own orgs"
  ON public.organizations FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), id));

-- RLS: Organization members - members can see co-members
CREATE POLICY "Members can read org members"
  ON public.organization_members FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

-- RLS: Shared templates - org members with business plan can read
CREATE POLICY "Org members can read shared templates"
  ON public.shared_templates FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) AND public.is_business_org(org_id));

CREATE POLICY "Org members can insert shared templates"
  ON public.shared_templates FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), org_id) AND public.is_business_org(org_id) AND auth.uid() = shared_by);

CREATE POLICY "Owners can delete shared templates"
  ON public.shared_templates FOR DELETE TO authenticated
  USING (auth.uid() = shared_by);

-- RLS: Shared prompts - same pattern
CREATE POLICY "Org members can read shared prompts"
  ON public.shared_prompts FOR SELECT TO authenticated
  USING (public.is_org_member(auth.uid(), org_id) AND public.is_business_org(org_id));

CREATE POLICY "Org members can insert shared prompts"
  ON public.shared_prompts FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), org_id) AND public.is_business_org(org_id) AND auth.uid() = shared_by);

CREATE POLICY "Owners can delete shared prompts"
  ON public.shared_prompts FOR DELETE TO authenticated
  USING (auth.uid() = shared_by);

-- Enable realtime for shared tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_templates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_prompts;

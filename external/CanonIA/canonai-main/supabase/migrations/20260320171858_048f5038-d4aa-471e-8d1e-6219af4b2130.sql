-- Create bucket for visual document templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('document-templates', 'document-templates', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for user-owned visual templates
CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  image_path TEXT NOT NULL,
  image_filename TEXT,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Policies for user-owned access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_templates' AND policyname = 'Users can read own document templates'
  ) THEN
    CREATE POLICY "Users can read own document templates"
    ON public.document_templates
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_templates' AND policyname = 'Users can insert own document templates'
  ) THEN
    CREATE POLICY "Users can insert own document templates"
    ON public.document_templates
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_templates' AND policyname = 'Users can update own document templates'
  ) THEN
    CREATE POLICY "Users can update own document templates"
    ON public.document_templates
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'document_templates' AND policyname = 'Users can delete own document templates'
  ) THEN
    CREATE POLICY "Users can delete own document templates"
    ON public.document_templates
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Updated-at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_document_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_document_templates_updated_at
    BEFORE UPDATE ON public.document_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Private storage policies for template images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read own document template images'
  ) THEN
    CREATE POLICY "Users can read own document template images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'document-templates'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own document template images'
  ) THEN
    CREATE POLICY "Users can upload own document template images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'document-templates'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update own document template images'
  ) THEN
    CREATE POLICY "Users can update own document template images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'document-templates'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'document-templates'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own document template images'
  ) THEN
    CREATE POLICY "Users can delete own document template images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'document-templates'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_document_templates_user_id_created_at
ON public.document_templates (user_id, created_at DESC);

-- Enum para tipos de conteúdo jurídico
CREATE TYPE public.legal_content_type AS ENUM (
  'peticao_inicial',
  'replica',
  'contestacao',
  'recurso',
  'jurisprudencia',
  'legislacao',
  'doutrina',
  'modelo',
  'parecer'
);

-- Enum para fonte do conteúdo
CREATE TYPE public.legal_source_type AS ENUM (
  'manual',
  'scraping',
  'upload'
);

-- Tabela principal de conhecimento jurídico
CREATE TABLE public.legal_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type legal_content_type NOT NULL,
  source_type legal_source_type NOT NULL DEFAULT 'manual',
  source_url TEXT,
  category TEXT NOT NULL DEFAULT 'inss_auxilio_acidente',
  tags TEXT[] DEFAULT '{}',
  tribunal TEXT,
  numero_processo TEXT,
  data_publicacao DATE,
  ementa TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de URLs já processadas (evitar duplicatas)
CREATE TABLE public.legal_scraped_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  content_count INTEGER DEFAULT 0,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.legal_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_scraped_urls ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de leitura (conteúdo jurídico público)
CREATE POLICY "Anyone can read legal knowledge" ON public.legal_knowledge FOR SELECT USING (true);
CREATE POLICY "Anyone can insert legal knowledge" ON public.legal_knowledge FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update legal knowledge" ON public.legal_knowledge FOR UPDATE USING (true);

CREATE POLICY "Anyone can read scraped urls" ON public.legal_scraped_urls FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scraped urls" ON public.legal_scraped_urls FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update scraped urls" ON public.legal_scraped_urls FOR UPDATE USING (true);

-- Índices para busca eficiente
CREATE INDEX idx_legal_knowledge_type ON public.legal_knowledge (content_type);
CREATE INDEX idx_legal_knowledge_category ON public.legal_knowledge (category);
CREATE INDEX idx_legal_knowledge_tags ON public.legal_knowledge USING GIN (tags);
CREATE INDEX idx_legal_knowledge_content_search ON public.legal_knowledge USING GIN (to_tsvector('portuguese', title || ' ' || content));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_legal_knowledge_updated_at
  BEFORE UPDATE ON public.legal_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

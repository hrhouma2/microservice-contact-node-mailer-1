-- ============================================
-- Contact Service API - Supabase Schema
-- ============================================
-- Ce script crée la table form_submissions et configure
-- les index et permissions nécessaires.

-- 1. Activer l'extension UUID (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Créer la table form_submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  message TEXT,
  page_url TEXT,
  referrer TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id 
  ON form_submissions(form_id);

CREATE INDEX IF NOT EXISTS idx_form_submissions_email 
  ON form_submissions(email);

CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at 
  ON form_submissions(created_at DESC);

-- 4. Créer un index GIN pour les recherches JSON (optionnel)
CREATE INDEX IF NOT EXISTS idx_form_submissions_data_gin 
  ON form_submissions USING GIN (data);

-- 5. Ajouter des commentaires sur les colonnes
COMMENT ON TABLE form_submissions IS 
  'Stockage des soumissions de formulaires de contact multi-sites';

COMMENT ON COLUMN form_submissions.id IS 
  'Identifiant unique (UUID v4)';

COMMENT ON COLUMN form_submissions.form_id IS 
  'Identifiant du formulaire (ex: astro-contact, next-devis)';

COMMENT ON COLUMN form_submissions.email IS 
  'Email du contact';

COMMENT ON COLUMN form_submissions.name IS 
  'Nom du contact (optionnel)';

COMMENT ON COLUMN form_submissions.message IS 
  'Message du contact (optionnel)';

COMMENT ON COLUMN form_submissions.page_url IS 
  'URL complète de la page d''origine';

COMMENT ON COLUMN form_submissions.referrer IS 
  'Référent (document.referrer)';

COMMENT ON COLUMN form_submissions.data IS 
  'Champs dynamiques supplémentaires (JSON)';

COMMENT ON COLUMN form_submissions.created_at IS 
  'Date de création de la soumission';

-- 6. Row Level Security (RLS) - OPTIONNEL
-- Décommentez si vous souhaitez activer RLS

-- ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre l'insertion via service_role
-- CREATE POLICY "Allow service role to insert" ON form_submissions
--   FOR INSERT
--   TO service_role
--   WITH CHECK (true);

-- Policy pour permettre la lecture via service_role
-- CREATE POLICY "Allow service role to read" ON form_submissions
--   FOR SELECT
--   TO service_role
--   USING (true);

-- Policy pour permettre aux utilisateurs authentifiés de voir leurs propres soumissions
-- CREATE POLICY "Users can view own submissions" ON form_submissions
--   FOR SELECT
--   TO authenticated
--   USING (email = auth.email());

-- 7. Fonction pour statistiques (optionnel)
CREATE OR REPLACE FUNCTION get_submission_stats()
RETURNS TABLE (
  form_id TEXT,
  total_submissions BIGINT,
  unique_emails BIGINT,
  first_submission TIMESTAMPTZ,
  last_submission TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fs.form_id,
    COUNT(*) as total_submissions,
    COUNT(DISTINCT fs.email) as unique_emails,
    MIN(fs.created_at) as first_submission,
    MAX(fs.created_at) as last_submission
  FROM form_submissions fs
  GROUP BY fs.form_id
  ORDER BY total_submissions DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Vue pour les soumissions récentes (optionnel)
CREATE OR REPLACE VIEW recent_submissions AS
SELECT 
  id,
  form_id,
  email,
  name,
  LEFT(message, 100) as message_preview,
  page_url,
  created_at
FROM form_submissions
ORDER BY created_at DESC
LIMIT 100;

-- ============================================
-- Fin du script
-- ============================================

-- Vérification : Lister les tables créées
SELECT 
  table_name,
  (SELECT COUNT(*) FROM form_submissions) as total_rows
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'form_submissions';

-- Message de confirmation
DO $$ 
BEGIN 
  RAISE NOTICE 'Schema created successfully! ✓';
  RAISE NOTICE 'Table: form_submissions';
  RAISE NOTICE 'Indexes: 4 created';
  RAISE NOTICE 'You can now use the Contact Service API!';
END $$;


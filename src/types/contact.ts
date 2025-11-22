/**
 * Types TypeScript pour le service de contact
 */

/**
 * Payload principal pour une soumission de formulaire de contact
 */
export interface ContactPayload {
  // Champs obligatoires
  form_id: string;
  email: string;

  // Champs optionnels standards
  name?: string;
  message?: string;
  page_url?: string;
  referrer?: string;

  // Données dynamiques supplémentaires (JSON)
  data?: Record<string, any>;
}

/**
 * Structure de la table form_submissions dans Supabase
 */
export interface FormSubmission {
  id?: string;
  form_id: string;
  email: string;
  name?: string | null;
  message?: string | null;
  page_url?: string | null;
  referrer?: string | null;
  data?: Record<string, any> | null;
  created_at?: string;
}

/**
 * Résultat de validation
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  sanitizedPayload?: ContactPayload;
}

/**
 * Options de configuration pour le rate limiting
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Entrée de rate limiting (stockage en mémoire)
 */
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}


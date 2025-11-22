/**
 * Module de validation pour les payloads de contact
 * 
 * Utilise Zod pour une validation stricte et type-safe des données entrantes.
 */

import { z } from 'zod';
import type { ContactPayload, ValidationResult } from '@/types/contact';

// Constantes de validation
const MAX_MESSAGE_LENGTH = 5000;
const MAX_STRING_LENGTH = 500;
const MAX_PAYLOAD_SIZE_BYTES = 100000; // 100KB

/**
 * Schéma Zod pour la validation du payload de contact
 */
const contactPayloadSchema = z.object({
  // Champs obligatoires
  form_id: z
    .string()
    .min(1, 'form_id est obligatoire')
    .max(100, 'form_id ne doit pas dépasser 100 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'form_id ne peut contenir que des lettres, chiffres, tirets et underscores'),

  email: z
    .string()
    .min(1, 'email est obligatoire')
    .email('Format d\'email invalide')
    .max(MAX_STRING_LENGTH, `email ne doit pas dépasser ${MAX_STRING_LENGTH} caractères`)
    .toLowerCase()
    .trim(),

  // Champs optionnels
  name: z
    .string()
    .max(MAX_STRING_LENGTH, `name ne doit pas dépasser ${MAX_STRING_LENGTH} caractères`)
    .trim()
    .optional(),

  message: z
    .string()
    .max(MAX_MESSAGE_LENGTH, `message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères`)
    .trim()
    .optional(),

  page_url: z
    .string()
    .url('page_url doit être une URL valide')
    .max(MAX_STRING_LENGTH, `page_url ne doit pas dépasser ${MAX_STRING_LENGTH} caractères`)
    .optional()
    .or(z.literal('')),

  referrer: z
    .string()
    .max(MAX_STRING_LENGTH, `referrer ne doit pas dépasser ${MAX_STRING_LENGTH} caractères`)
    .optional(),

  // Données dynamiques supplémentaires
  data: z
    .record(z.any())
    .optional(),
});

/**
 * Valide le payload de contact reçu
 * 
 * @param input - Données brutes à valider
 * @returns Résultat de validation avec payload sanitized ou erreurs
 */
export function validateContactPayload(input: any): ValidationResult {
  try {
    // Vérification de la taille totale du payload
    const payloadSize = JSON.stringify(input).length;
    if (payloadSize > MAX_PAYLOAD_SIZE_BYTES) {
      return {
        valid: false,
        errors: [
          `Le payload est trop volumineux (${payloadSize} bytes). Maximum: ${MAX_PAYLOAD_SIZE_BYTES} bytes`,
        ],
      };
    }

    // Validation avec Zod
    const result = contactPayloadSchema.safeParse(input);

    if (!result.success) {
      // Extraction des messages d'erreur
      const errors = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      
      console.warn('[Validation] Échec de la validation:', errors);
      
      return {
        valid: false,
        errors,
      };
    }

    // Sanitization supplémentaire
    const sanitized: ContactPayload = {
      form_id: result.data.form_id,
      email: result.data.email,
      name: result.data.name,
      message: result.data.message,
      page_url: result.data.page_url || undefined,
      referrer: result.data.referrer,
      data: result.data.data,
    };

    // Nettoyer les propriétés undefined pour un JSON plus propre
    Object.keys(sanitized).forEach((key) => {
      if (sanitized[key as keyof ContactPayload] === undefined) {
        delete sanitized[key as keyof ContactPayload];
      }
    });

    console.log('[Validation] Validation réussie pour form_id:', sanitized.form_id);

    return {
      valid: true,
      sanitizedPayload: sanitized,
    };
  } catch (error) {
    console.error('[Validation] Erreur lors de la validation:', error);
    return {
      valid: false,
      errors: ['Erreur interne lors de la validation'],
    };
  }
}

/**
 * Valide que la requête provient d'une origine autorisée
 * 
 * @param origin - En-tête Origin de la requête
 * @returns true si l'origine est autorisée, false sinon
 */
export function isOriginAllowed(origin: string | null): boolean {
  // Si pas d'origine (ex: requête Postman, curl), on autorise en dev
  if (!origin) {
    return process.env.NODE_ENV === 'development';
  }

  const allowedOrigins = process.env.CONTACT_ALLOWED_ORIGINS || '';
  
  // Pas d'origines configurées = mode permissif (attention en production!)
  if (!allowedOrigins.trim()) {
    console.warn('[Validation] ATTENTION: Aucune origine CORS configurée, toutes les origines sont autorisées');
    return true;
  }

  const origins = allowedOrigins.split(',').map((o) => o.trim());
  const isAllowed = origins.includes(origin);

  if (!isAllowed) {
    console.warn('[Validation] Origine non autorisée:', origin);
  }

  return isAllowed;
}

/**
 * Valide le format d'un email (validation simple)
 * Utilisé comme fallback si Zod n'est pas disponible
 * 
 * @param email - Email à valider
 * @returns true si le format est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize une chaîne pour éviter les injections
 * 
 * @param str - Chaîne à nettoyer
 * @returns Chaîne nettoyée
 */
export function sanitizeString(str: string): string {
  return str
    .trim()
    .replace(/[<>]/g, '') // Retire les balises HTML basiques
    .slice(0, MAX_STRING_LENGTH);
}


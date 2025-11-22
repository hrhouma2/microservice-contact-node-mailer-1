/**
 * Client Supabase côté serveur
 * 
 * Ce fichier initialise le client Supabase avec la service role key
 * pour permettre les opérations administratives côté serveur.
 * 
 * ATTENTION: Ne JAMAIS utiliser ce client côté client!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { FormSubmission } from '@/types/contact';

// Validation des variables d'environnement
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env'
  );
}

// Création du client Supabase avec service role key
const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Insère une nouvelle soumission de formulaire dans Supabase
 * 
 * @param submission - Données de la soumission à insérer
 * @returns Promise avec l'ID de la soumission créée
 * @throws Error si l'insertion échoue
 */
export async function insertFormSubmission(
  submission: FormSubmission
): Promise<string> {
  try {
    console.log('[Supabase] Insertion de la soumission:', {
      form_id: submission.form_id,
      email: submission.email,
    });

    const { data, error } = await supabase
      .from('form_submissions')
      .insert([
        {
          form_id: submission.form_id,
          email: submission.email,
          name: submission.name || null,
          message: submission.message || null,
          page_url: submission.page_url || null,
          referrer: submission.referrer || null,
          data: submission.data || null,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('[Supabase] Erreur lors de l\'insertion:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    console.log('[Supabase] Soumission insérée avec succès, ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('[Supabase] Exception lors de l\'insertion:', error);
    throw error;
  }
}

/**
 * Récupère les statistiques des soumissions par form_id
 * (Fonction exemple pour usage futur)
 * 
 * @param formId - ID du formulaire
 * @returns Promise avec le nombre de soumissions
 */
export async function getSubmissionCount(formId?: string): Promise<number> {
  try {
    let query = supabase
      .from('form_submissions')
      .select('id', { count: 'exact', head: true });

    if (formId) {
      query = query.eq('form_id', formId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('[Supabase] Erreur lors du comptage:', error);
    throw error;
  }
}

// Export du client pour usage direct si nécessaire
export default supabase;


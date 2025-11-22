/**
 * Route API POST /api/contact
 * 
 * Point d'entrée principal pour recevoir les soumissions de formulaires de contact.
 * 
 * Fonctionnalités:
 * - Validation des données entrantes
 * - Vérification CORS
 * - Rate limiting
 * - Enregistrement dans Supabase
 * - Envoi d'email de notification via Nodemailer
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateContactPayload } from '@/lib/validation';
import { insertFormSubmission } from '@/lib/supabaseClient';
import { sendContactNotification } from '@/lib/mailer';
import { addCorsHeaders, checkCorsOrigin, handleCorsPrelight } from '@/lib/cors';
import { rateLimitMiddleware, getClientIp } from '@/lib/rateLimit';
import type { ContactPayload, FormSubmission } from '@/types/contact';

/**
 * Handler pour les requêtes OPTIONS (CORS preflight)
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPrelight(request);
}

/**
 * Handler pour les requêtes POST
 * Traite les soumissions de formulaires de contact
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const origin = request.headers.get('origin');

  console.log('\n========================================');
  console.log('[Contact API] Nouvelle requête POST reçue');
  console.log('[Contact API] Origin:', origin || 'none');
  console.log('[Contact API] IP:', getClientIp(request));
  console.log('========================================\n');

  try {
    // 1. Vérification CORS
    const corsError = checkCorsOrigin(request);
    if (corsError) {
      return addCorsHeaders(corsError, origin);
    }

    // 2. Rate Limiting
    const rateLimitError = rateLimitMiddleware(request);
    if (rateLimitError) {
      return addCorsHeaders(
        new NextResponse(rateLimitError.body, {
          status: rateLimitError.status,
          headers: rateLimitError.headers,
        }),
        origin
      );
    }

    // 3. Parsing du body JSON
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      console.error('[Contact API] Erreur de parsing JSON:', error);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: 'Invalid JSON',
            message: 'Le corps de la requête doit être un JSON valide',
          },
          { status: 400 }
        ),
        origin
      );
    }

    console.log('[Contact API] Payload reçu:', {
      form_id: body.form_id,
      email: body.email,
      has_name: !!body.name,
      has_message: !!body.message,
      has_data: !!body.data,
    });

    // 4. Validation du payload
    const validationResult = validateContactPayload(body);

    if (!validationResult.valid || !validationResult.sanitizedPayload) {
      console.warn('[Contact API] Validation échouée:', validationResult.errors);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Les données fournies sont invalides',
            details: validationResult.errors,
          },
          { status: 400 }
        ),
        origin
      );
    }

    const payload: ContactPayload = validationResult.sanitizedPayload;

    // 5. Préparation de la soumission pour Supabase
    const submission: FormSubmission = {
      form_id: payload.form_id,
      email: payload.email,
      name: payload.name,
      message: payload.message,
      page_url: payload.page_url,
      referrer: payload.referrer,
      data: payload.data,
    };

    // 6. Insertion dans Supabase
    let submissionId: string;
    try {
      submissionId = await insertFormSubmission(submission);
      console.log('[Contact API] ✓ Soumission enregistrée dans Supabase, ID:', submissionId);
    } catch (error) {
      console.error('[Contact API] ✗ Erreur lors de l\'insertion Supabase:', error);
      return addCorsHeaders(
        NextResponse.json(
          {
            error: 'Database Error',
            message: 'Erreur lors de l\'enregistrement de votre message. Veuillez réessayer.',
          },
          { status: 500 }
        ),
        origin
      );
    }

    // 7. Envoi de l'email de notification
    // Note: Si l'email échoue, on renvoie quand même un succès car la soumission est enregistrée
    try {
      await sendContactNotification(payload);
      console.log('[Contact API] ✓ Email de notification envoyé avec succès');
    } catch (error) {
      console.error('[Contact API] ⚠ Erreur lors de l\'envoi de l\'email (non-bloquant):', error);
      // On ne retourne pas d'erreur car l'insertion Supabase a réussi
      // L'administrateur verra l'erreur dans les logs
    }

    // 8. Réponse de succès
    const duration = Date.now() - startTime;
    console.log(`[Contact API] ✓ Requête traitée avec succès en ${duration}ms\n`);

    return addCorsHeaders(
      NextResponse.json(
        {
          ok: true,
          message: 'Votre message a été envoyé avec succès',
          submission_id: submissionId,
        },
        { status: 201 }
      ),
      origin
    );
  } catch (error) {
    // Gestion des erreurs non prévues
    console.error('[Contact API] ✗ Erreur inattendue:', error);
    
    const duration = Date.now() - startTime;
    console.log(`[Contact API] ✗ Requête échouée après ${duration}ms\n`);

    return addCorsHeaders(
      NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
        },
        { status: 500 }
      ),
      origin
    );
  }
}

/**
 * Handler pour les autres méthodes HTTP (GET, PUT, DELETE, etc.)
 * Renvoie une erreur 405 Method Not Allowed
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'Cette route accepte uniquement les requêtes POST',
      usage: {
        method: 'POST',
        endpoint: '/api/contact',
        contentType: 'application/json',
        requiredFields: ['form_id', 'email'],
        optionalFields: ['name', 'message', 'page_url', 'referrer', 'data'],
      },
    },
    { status: 405 }
  );
}


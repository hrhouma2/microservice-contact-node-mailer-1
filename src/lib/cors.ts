/**
 * Gestion CORS pour l'API de contact
 * 
 * Ce module gère les en-têtes CORS pour autoriser uniquement
 * les origines configurées à appeler l'API.
 */

import { NextResponse } from 'next/server';
import { isOriginAllowed } from './validation';

/**
 * Ajoute les en-têtes CORS appropriés à une réponse
 * 
 * @param response - Réponse Next.js à modifier
 * @param origin - Origine de la requête
 * @returns Réponse avec en-têtes CORS
 */
export function addCorsHeaders(
  response: NextResponse,
  origin: string | null
): NextResponse {
  if (origin && isOriginAllowed(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 heures
  }

  return response;
}

/**
 * Gère les requêtes OPTIONS (preflight CORS)
 * 
 * @param request - Requête Next.js
 * @returns Réponse pour la requête preflight
 */
export function handleCorsPrelight(request: Request): NextResponse {
  const origin = request.headers.get('origin');

  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden - Origin not allowed',
    });
  }

  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

/**
 * Vérifie si la requête provient d'une origine autorisée
 * Si non autorisée, retourne une réponse d'erreur
 * 
 * @param request - Requête Next.js
 * @returns NextResponse d'erreur si non autorisé, null sinon
 */
export function checkCorsOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get('origin');

  // En développement sans origin (Postman, curl), on autorise
  if (!origin && process.env.NODE_ENV === 'development') {
    return null;
  }

  if (!isOriginAllowed(origin)) {
    console.warn('[CORS] Requête bloquée depuis:', origin);
    return NextResponse.json(
      {
        error: 'Origin not allowed',
        message: 'Votre domaine n\'est pas autorisé à accéder à cette API',
      },
      { status: 403 }
    );
  }

  return null;
}


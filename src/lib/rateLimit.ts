/**
 * Rate Limiting simple en mémoire
 * 
 * ATTENTION: Cette implémentation en mémoire est suffisante pour un usage basique
 * mais ne fonctionne PAS correctement en environnement serverless avec plusieurs instances.
 * 
 * Pour un usage en production avec du trafic important, considérez:
 * - Vercel KV (Redis)
 * - Upstash Redis
 * - Ou tout autre solution de stockage partagé
 */

import type { RateLimitConfig, RateLimitEntry } from '@/types/contact';

// Stockage en mémoire des compteurs par IP
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration par défaut
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
};

/**
 * Nettoie les entrées expirées du store (garbage collection)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => rateLimitStore.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`[RateLimit] Nettoyage: ${keysToDelete.length} entrées expirées supprimées`);
  }
}

/**
 * Extrait l'adresse IP de la requête
 * Gère les headers de proxy (x-forwarded-for, x-real-ip)
 * 
 * @param request - Requête Next.js
 * @returns Adresse IP du client
 */
export function getClientIp(request: Request): string {
  // Headers de proxy Vercel/CloudFlare/etc
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) {
    // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
    return forwardedFor.split(',')[0].trim();
  }

  return 'unknown';
}

/**
 * Vérifie si une requête dépasse la limite de taux
 * 
 * @param identifier - Identifiant unique (généralement l'IP)
 * @param config - Configuration du rate limiting (optionnel)
 * @returns Objet indiquant si la limite est atteinte et les détails
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  
  // Nettoyage périodique (toutes les 100 requêtes)
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  const entry = rateLimitStore.get(identifier);

  // Première requête ou fenêtre expirée
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    
    rateLimitStore.set(identifier, newEntry);

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Incrémenter le compteur
  entry.count++;

  // Vérifier si la limite est dépassée
  const allowed = entry.count <= config.maxRequests;

  if (!allowed) {
    console.warn(
      `[RateLimit] Limite dépassée pour ${identifier}: ${entry.count}/${config.maxRequests}`
    );
  }

  return {
    allowed,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

/**
 * Middleware de rate limiting pour les routes API
 * 
 * @param request - Requête Next.js
 * @returns null si autorisé, Response d'erreur si limite dépassée
 */
export function rateLimitMiddleware(request: Request): Response | null {
  // Désactiver le rate limiting en développement si souhaité
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
    return null;
  }

  const ip = getClientIp(request);
  const result = checkRateLimit(ip);

  // Ajouter les headers de rate limiting à toutes les réponses
  // (sera fait dans la route principale)

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime).toISOString();
    
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        resetTime: resetDate,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Ajoute les headers de rate limiting à une réponse
 * 
 * @param response - Réponse à modifier
 * @param identifier - Identifiant du client
 * @returns Réponse avec headers de rate limiting
 */
export function addRateLimitHeaders(
  response: Response,
  identifier: string
): Response {
  const entry = rateLimitStore.get(identifier);
  
  if (entry) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-RateLimit-Limit', DEFAULT_CONFIG.maxRequests.toString());
    newHeaders.set(
      'X-RateLimit-Remaining',
      Math.max(0, DEFAULT_CONFIG.maxRequests - entry.count).toString()
    );
    newHeaders.set('X-RateLimit-Reset', entry.resetTime.toString());

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return response;
}

/**
 * Réinitialise le rate limit pour un identifiant (utile pour les tests)
 * 
 * @param identifier - Identifiant à réinitialiser
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
  console.log(`[RateLimit] Réinitialisation pour: ${identifier}`);
}

/**
 * Obtient les statistiques du rate limiting
 * 
 * @returns Objet avec les statistiques
 */
export function getRateLimitStats(): {
  totalEntries: number;
  config: RateLimitConfig;
} {
  return {
    totalEntries: rateLimitStore.size,
    config: DEFAULT_CONFIG,
  };
}


/**
 * Route API GET /api/health
 * 
 * Health check endpoint pour vérifier que le service est opérationnel.
 * Utile pour les outils de monitoring et les load balancers.
 */

import { NextResponse } from 'next/server';
import { getRateLimitStats } from '@/lib/rateLimit';

/**
 * Handler pour les requêtes GET
 * Retourne l'état de santé du service
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Vérification des variables d'environnement critiques
    const envCheck = {
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      smtp: !!(
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
      ),
      notificationEmail: !!process.env.CONTACT_NOTIFICATION_EMAIL,
      cors: !!process.env.CONTACT_ALLOWED_ORIGINS,
    };

    // Calcul du temps de réponse
    const responseTime = Date.now() - startTime;

    // Déterminer le statut global
    const isHealthy = envCheck.supabase && envCheck.smtp && envCheck.notificationEmail;

    // Statistiques du rate limiting
    const rateLimitStats = getRateLimitStats();

    // Informations système
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'unknown',
      uptime: process.uptime(),
      memoryUsage: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    };

    // Réponse de santé complète
    return NextResponse.json(
      {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        service: {
          name: 'contact-service',
          version: '1.0.0',
          description: 'Microservice API pour formulaires de contact',
        },
        environment: envCheck,
        warnings: [
          ...(!envCheck.supabase ? ['Supabase non configuré'] : []),
          ...(!envCheck.smtp ? ['SMTP non configuré'] : []),
          ...(!envCheck.notificationEmail ? ['Email de notification non configuré'] : []),
          ...(!envCheck.cors ? ['CORS non configuré (mode permissif)'] : []),
        ],
        rateLimit: {
          activeConnections: rateLimitStats.totalEntries,
          maxRequests: rateLimitStats.config.maxRequests,
          windowMs: rateLimitStats.config.windowMs,
        },
        system: systemInfo,
      },
      {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[Health] Erreur lors du health check:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Handler HEAD pour les health checks minimalistes
 */
export async function HEAD() {
  // Health check ultra-léger pour les load balancers
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}


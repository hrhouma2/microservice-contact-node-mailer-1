/**
 * Spécification OpenAPI 3.0 pour l'API Contact Service
 * 
 * Cette spécification décrit tous les endpoints disponibles,
 * leurs paramètres, et les réponses attendues.
 */

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Contact Service API',
    version: '1.0.0',
    description: `
Microservice API pour gérer des formulaires de contact multi-sites.

## Fonctionnalités

- Validation stricte des données
- Stockage dans Supabase (PostgreSQL)
- Notifications par email via Nodemailer
- Support de formulaires dynamiques avec champs JSON
- Rate limiting intégré
- Gestion CORS configurable

## Authentification

Aucune authentification requise. La sécurité est assurée par:
- Validation CORS (origines autorisées)
- Rate limiting par IP
- Validation stricte des données

## Variables d'environnement requises

- \`SUPABASE_URL\`: URL du projet Supabase
- \`SUPABASE_SERVICE_ROLE_KEY\`: Clé service role Supabase
- \`SMTP_HOST\`: Hôte SMTP
- \`SMTP_PORT\`: Port SMTP
- \`SMTP_USER\`: Utilisateur SMTP
- \`SMTP_PASS\`: Mot de passe SMTP
- \`CONTACT_NOTIFICATION_EMAIL\`: Email destinataire des notifications
- \`CONTACT_ALLOWED_ORIGINS\`: Origines CORS autorisées (séparées par virgules)
    `,
    contact: {
      name: 'Support API',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Développement local',
    },
    {
      url: 'https://your-domain.vercel.app',
      description: 'Production (Vercel)',
    },
  ],
  tags: [
    {
      name: 'Contact',
      description: 'Endpoints pour gérer les soumissions de formulaires de contact',
    },
    {
      name: 'Health',
      description: 'Endpoints de monitoring et health checks',
    },
  ],
  paths: {
    '/api/contact': {
      post: {
        tags: ['Contact'],
        summary: 'Soumettre un formulaire de contact',
        description: `
Endpoint principal pour soumettre un formulaire de contact.

Le formulaire est enregistré dans Supabase et déclenche l'envoi d'un email de notification.

**Limites:**
- Rate limit: 10 requêtes par minute par IP (configurable)
- Taille max du message: 5000 caractères
- Taille max du payload: 100KB
        `,
        operationId: 'submitContact',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ContactPayload',
              },
              examples: {
                minimal: {
                  summary: 'Exemple minimal',
                  value: {
                    form_id: 'astro-contact',
                    email: 'user@example.com',
                  },
                },
                complete: {
                  summary: 'Exemple complet',
                  value: {
                    form_id: 'next-devis',
                    email: 'client@company.com',
                    name: 'Jean Dupont',
                    message: 'Je souhaite obtenir un devis pour un projet web.',
                    page_url: 'https://monsite.com/contact',
                    referrer: 'https://google.com',
                    data: {
                      company: 'ACME Corp',
                      phone: '+33612345678',
                      budget: '10000-25000',
                      project_type: 'website',
                      deadline: '2024-03-01',
                    },
                  },
                },
                htmlLanding: {
                  summary: 'Landing page HTML',
                  value: {
                    form_id: 'html-landing',
                    email: 'prospect@startup.io',
                    name: 'Marie Martin',
                    message: 'Inscription à la newsletter',
                    page_url: 'https://landing.startup.io',
                    data: {
                      newsletter: true,
                      source: 'facebook-ads',
                      campaign: 'launch-2024',
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Soumission enregistrée avec succès',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Données invalides',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  error: 'Validation Error',
                  message: 'Les données fournies sont invalides',
                  details: ['email: Format d\'email invalide'],
                },
              },
            },
          },
          '403': {
            description: 'Origine non autorisée (CORS)',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '429': {
            description: 'Rate limit dépassé',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RateLimitError',
                },
              },
            },
          },
          '500': {
            description: 'Erreur serveur',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Contact'],
        summary: 'Informations sur l\'endpoint',
        description: 'Retourne les informations d\'usage de l\'endpoint POST /api/contact',
        operationId: 'getContactInfo',
        responses: {
          '405': {
            description: 'Méthode non autorisée',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                    usage: {
                      type: 'object',
                      properties: {
                        method: { type: 'string' },
                        endpoint: { type: 'string' },
                        contentType: { type: 'string' },
                        requiredFields: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        optionalFields: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      options: {
        tags: ['Contact'],
        summary: 'CORS preflight',
        description: 'Gère les requêtes CORS preflight',
        operationId: 'contactOptions',
        responses: {
          '204': {
            description: 'Preflight réussi',
          },
          '403': {
            description: 'Origine non autorisée',
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check du service',
        description: `
Endpoint de monitoring pour vérifier l'état du service.

Retourne des informations détaillées sur:
- Configuration des variables d'environnement
- Statistiques du rate limiting
- Informations système (mémoire, uptime, etc.)
        `,
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Service opérationnel',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
          '503': {
            description: 'Service dégradé',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
      head: {
        tags: ['Health'],
        summary: 'Health check léger',
        description: 'Version légère du health check pour les load balancers',
        operationId: 'healthCheckHead',
        responses: {
          '200': {
            description: 'Service opérationnel',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ContactPayload: {
        type: 'object',
        required: ['form_id', 'email'],
        properties: {
          form_id: {
            type: 'string',
            description: 'Identifiant unique du formulaire',
            pattern: '^[a-zA-Z0-9_-]+$',
            example: 'astro-contact',
            minLength: 1,
            maxLength: 100,
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email du contact',
            example: 'user@example.com',
            maxLength: 500,
          },
          name: {
            type: 'string',
            description: 'Nom du contact',
            example: 'Jean Dupont',
            maxLength: 500,
          },
          message: {
            type: 'string',
            description: 'Message du contact',
            example: 'Je souhaite plus d\'informations sur vos services.',
            maxLength: 5000,
          },
          page_url: {
            type: 'string',
            format: 'uri',
            description: 'URL complète de la page d\'origine',
            example: 'https://monsite.com/contact',
            maxLength: 500,
          },
          referrer: {
            type: 'string',
            description: 'Référent (document.referrer)',
            example: 'https://google.com/search?q=...',
            maxLength: 500,
          },
          data: {
            type: 'object',
            description: 'Champs dynamiques supplémentaires (JSON)',
            additionalProperties: true,
            example: {
              company: 'ACME Corp',
              phone: '+33612345678',
              budget: '10000-25000',
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          ok: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Votre message a été envoyé avec succès',
          },
          submission_id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Validation Error',
          },
          message: {
            type: 'string',
            example: 'Les données fournies sont invalides',
          },
          details: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['email: Format d\'email invalide'],
          },
        },
      },
      RateLimitError: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            example: 'Too Many Requests',
          },
          message: {
            type: 'string',
            example: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.',
          },
          retryAfter: {
            type: 'integer',
            description: 'Nombre de secondes avant de pouvoir réessayer',
            example: 45,
          },
          resetTime: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['ok', 'degraded', 'error'],
            example: 'ok',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:00:00.000Z',
          },
          responseTime: {
            type: 'string',
            example: '5ms',
          },
          service: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'contact-service' },
              version: { type: 'string', example: '1.0.0' },
              description: { type: 'string' },
            },
          },
          environment: {
            type: 'object',
            properties: {
              supabase: { type: 'boolean' },
              smtp: { type: 'boolean' },
              notificationEmail: { type: 'boolean' },
              cors: { type: 'boolean' },
            },
          },
          warnings: {
            type: 'array',
            items: { type: 'string' },
          },
          rateLimit: {
            type: 'object',
            properties: {
              activeConnections: { type: 'integer' },
              maxRequests: { type: 'integer' },
              windowMs: { type: 'integer' },
            },
          },
          system: {
            type: 'object',
            properties: {
              nodeVersion: { type: 'string' },
              platform: { type: 'string' },
              environment: { type: 'string' },
              uptime: { type: 'number' },
              memoryUsage: {
                type: 'object',
                properties: {
                  heapUsed: { type: 'integer' },
                  heapTotal: { type: 'integer' },
                  rss: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default openApiSpec;


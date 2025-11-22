/**
 * Page de documentation Swagger UI
 * 
 * Affiche la documentation interactive de l'API avec Swagger UI
 * Accessible à l'URL: /api-docs
 */

'use client';

import dynamic from 'next/dynamic';
import { openApiSpec } from '@/lib/openapi';
import 'swagger-ui-react/swagger-ui.css';

// Chargement dynamique de SwaggerUI pour éviter les erreurs SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fafafa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header personnalisé */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            📬 Contact Service API Documentation
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1rem',
            opacity: 0.9
          }}>
            Microservice API pour gérer des formulaires de contact multi-sites
          </p>
          <div style={{ 
            marginTop: '1rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.875rem'
            }}>
              Next.js 15
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.875rem'
            }}>
              TypeScript
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.875rem'
            }}>
              Supabase
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.875rem'
            }}>
              Nodemailer
            </span>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          gap: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <a 
            href="#/Contact/submitContact" 
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            POST /api/contact
          </a>
          <a 
            href="#/Health/healthCheck" 
            style={{
              color: '#667eea',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            GET /api/health
          </a>
          <span style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280' }}>
            Version 1.0.0
          </span>
        </div>
      </div>

      {/* Swagger UI */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '2rem'
      }}>
        <SwaggerUI 
          spec={openApiSpec}
          docExpansion="list"
          defaultModelsExpandDepth={1}
          defaultModelExpandDepth={3}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          tryItOutEnabled={true}
        />
      </div>

      {/* Footer */}
      <div style={{
        background: '#1f2937',
        color: '#9ca3af',
        padding: '2rem',
        marginTop: '4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
            Contact Service API - Microservice de gestion de formulaires
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem' }}>
            Développé avec ❤️ en utilisant Next.js, TypeScript, Supabase et Nodemailer
          </p>
        </div>
      </div>
    </div>
  );
}


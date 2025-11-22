# Contact Service API - Guide Complet

Microservice API Next.js pour gérer des formulaires de contact multi-sites avec Supabase et Nodemailer.

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Installation Rapide](#installation-rapide)
3. [Configuration Détaillée](#configuration-détaillée)
   - [Configuration Supabase](#configuration-supabase)
   - [Configuration SMTP](#configuration-smtp)
   - [Variables d'environnement](#variables-denvironnement)
4. [Utilisation de l'API](#utilisation-de-lapi)
   - [Endpoints disponibles](#endpoints-disponibles)
   - [Exemples de requêtes](#exemples-de-requêtes)
5. [Intégration Frontend](#intégration-frontend)
   - [Astro](#exemple-astro)
   - [Next.js](#exemple-nextjs)
   - [React](#exemple-react)
   - [HTML/JavaScript](#exemple-html-pur)
6. [Base de Données](#base-de-données)
7. [Déploiement sur Vercel](#déploiement-sur-vercel)
8. [Sécurité](#sécurité)
9. [Dépannage](#dépannage)
10. [Architecture Technique](#architecture-technique)

---

## Vue d'ensemble

### Objectif

Service API-only qui expose un endpoint POST unique pour recevoir, valider, enregistrer et notifier les soumissions de formulaires de contact provenant de différents sites web.

### Fonctionnalités

- API REST avec route POST `/api/contact`
- Validation stricte des données avec Zod
- Stockage PostgreSQL via Supabase
- Notifications email via Nodemailer (SMTP)
- Support multi-formulaires avec champs dynamiques JSON
- Rate limiting par IP (10 req/min par défaut)
- CORS configurable pour sécuriser les origines
- Health check pour monitoring
- Documentation Swagger/OpenAPI interactive
- TypeScript strict avec types complets
- Prêt pour Vercel (plan gratuit)

### Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (mode strict)
- **Base de données**: Supabase (PostgreSQL)
- **Email**: Nodemailer (SMTP)
- **Validation**: Zod
- **Documentation**: Swagger UI + OpenAPI 3.0
- **Déploiement**: Vercel

---

## Installation Rapide

### Prérequis

- Node.js 18+ et npm
- Un projet Supabase (gratuit)
- Un compte SMTP (Gmail, SendGrid, Sendinblue, etc.)

### Étapes d'installation (10 minutes)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier de configuration
cp .env.example .env.local

# 3. Éditer .env.local avec vos credentials
# (voir section Configuration Détaillée ci-dessous)

# 4. Lancer le serveur
npm run dev

# 5. Accéder à la documentation
# http://localhost:3000/api-docs
```

---

## Configuration Détaillée

### Configuration Supabase

#### Étape 1 : Créer un projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte (gratuit)
3. Créez un nouveau projet
   - Nom : `contact-service`
   - Région : Choisissez la plus proche
   - Notez le mot de passe du projet

#### Étape 2 : Créer la table

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez-collez le contenu du fichier `supabase-schema.sql`
3. Cliquez sur **Run** (F5)
4. Vérifiez que la table `form_submissions` est créée dans **Table Editor**

#### Étape 3 : Récupérer les credentials

1. Allez dans **Project Settings** > **API**
2. Copiez :
   - **Project URL** -> `SUPABASE_URL`
   - **service_role key** (cliquez sur "Reveal") -> `SUPABASE_SERVICE_ROLE_KEY`

**IMPORTANT** : Le service_role key ne doit JAMAIS être exposé côté client !

### Configuration SMTP

#### Option A : Gmail (Recommandé pour débuter)

1. Allez sur https://myaccount.google.com/security
2. Activez la "Validation en deux étapes"
3. Allez sur https://myaccount.google.com/apppasswords
4. Générez un mot de passe d'application :
   - App : **Mail**
   - Device : **Other** -> "Contact Service API"
5. Copiez le mot de passe généré (16 caractères)

Vos paramètres SMTP :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe généré
```

#### Option B : Autres fournisseurs SMTP

- **SendGrid** : smtp.sendgrid.net (port 587)
- **Sendinblue** : smtp-relay.sendinblue.com (port 587)
- **Mailgun** : smtp.mailgun.org (port 587)

Consultez la documentation de votre fournisseur pour les credentials.

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre-key-ici...

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application

# Email de notification
CONTACT_NOTIFICATION_EMAIL=votre-email@gmail.com

# CORS - Domaines autorisés (séparés par des virgules)
CONTACT_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4321,https://votresite.com

# Rate limiting (optionnel)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Environment
NODE_ENV=development
```

---

## Utilisation de l'API

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/contact` | Soumettre un formulaire de contact |
| GET | `/api/health` | Vérifier l'état du service |
| GET | `/api-docs` | Documentation Swagger UI |

### Documentation Interactive

Accédez à **http://localhost:3000/api-docs** pour une documentation interactive avec possibilité de tester directement les endpoints.

### POST /api/contact

#### Payload minimal

```json
{
  "form_id": "mon-formulaire",
  "email": "user@example.com"
}
```

#### Payload complet

```json
{
  "form_id": "formulaire-devis",
  "email": "client@company.com",
  "name": "Jean Dupont",
  "message": "Je souhaite obtenir un devis pour un projet web.",
  "page_url": "https://monsite.com/contact",
  "referrer": "https://google.com",
  "data": {
    "company": "ACME Corp",
    "phone": "+33612345678",
    "budget": "10000-25000",
    "project_type": "website",
    "deadline": "2024-Q2"
  }
}
```

#### Réponse de succès (201)

```json
{
  "ok": true,
  "message": "Votre message a été envoyé avec succès",
  "submission_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Réponse d'erreur (400)

```json
{
  "error": "Validation Error",
  "message": "Les données fournies sont invalides",
  "details": [
    "email: Format d'email invalide"
  ]
}
```

### Exemples de requêtes

#### Avec curl

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "test",
    "email": "test@example.com",
    "name": "Test User",
    "message": "Ceci est un test"
  }'
```

#### Avec JavaScript/fetch

```javascript
const response = await fetch('http://localhost:3000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    form_id: 'mon-formulaire',
    email: 'user@example.com',
    name: 'Jean Dupont',
    message: 'Bonjour, je voudrais plus d\'informations.',
    page_url: window.location.href,
    referrer: document.referrer,
  }),
});

const result = await response.json();
console.log(result);
```

---

## Intégration Frontend

### Exemple Astro

```astro
---
// src/components/ContactForm.astro
---

<form id="contact-form" class="contact-form">
  <div class="form-group">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required />
  </div>
  
  <div class="form-group">
    <label for="name">Nom</label>
    <input type="text" id="name" name="name" />
  </div>
  
  <div class="form-group">
    <label for="message">Message *</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  
  <button type="submit">Envoyer</button>
  <div id="form-message" style="display: none;"></div>
</form>

<script>
  const form = document.getElementById('contact-form') as HTMLFormElement;
  const messageDiv = document.getElementById('form-message')!;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = {
      form_id: 'astro-contact',
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      message: formData.get('message') as string,
      page_url: window.location.href,
      referrer: document.referrer,
    };

    try {
      const response = await fetch('https://your-api.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = 'Message envoyé avec succès !';
        messageDiv.style.color = 'green';
        messageDiv.style.display = 'block';
        form.reset();
      } else {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      messageDiv.textContent = 'Erreur : ' + (error as Error).message;
      messageDiv.style.color = 'red';
      messageDiv.style.display = 'block';
    }
  });
</script>
```

### Exemple Next.js

```tsx
// app/contact/page.tsx
'use client';

import { useState, FormEvent } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://your-api.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: 'next-contact',
          ...formData,
          page_url: window.location.href,
          referrer: document.referrer,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message);
        setFormData({ email: '', name: '', message: '' });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage((error as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contactez-nous</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block font-medium mb-2">Email *</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="name" className="block font-medium mb-2">Nom</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label htmlFor="message" className="block font-medium mb-2">Message *</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? 'Envoi...' : 'Envoyer'}
        </button>

        {status === 'success' && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
```

### Exemple React

```tsx
// src/components/ContactForm.tsx
import { useState, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('https://your-api.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: 'react-contact',
          ...formData,
          page_url: window.location.href,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ email: '', name: '', message: '' });
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Nom"
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="Message"
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Envoi...' : 'Envoyer'}
      </button>
      {status === 'success' && <p>Message envoyé !</p>}
      {status === 'error' && <p>Erreur lors de l'envoi</p>}
    </form>
  );
}
```

### Exemple HTML pur

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Contact</title>
</head>
<body>
  <form id="contact-form">
    <input type="email" id="email" name="email" placeholder="Email" required />
    <input type="text" id="name" name="name" placeholder="Nom" />
    <textarea id="message" name="message" placeholder="Message" required></textarea>
    <button type="submit">Envoyer</button>
    <div id="form-message"></div>
  </form>

  <script>
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        form_id: 'html-contact',
        email: formData.get('email'),
        name: formData.get('name'),
        message: formData.get('message'),
        page_url: window.location.href,
        referrer: document.referrer,
      };

      try {
        const response = await fetch('https://your-api.vercel.app/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          messageDiv.textContent = 'Message envoyé avec succès !';
          messageDiv.style.color = 'green';
          form.reset();
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        messageDiv.textContent = 'Erreur : ' + error.message;
        messageDiv.style.color = 'red';
      }
    });
  </script>
</body>
</html>
```

---

## Base de Données

### Structure de la table `form_submissions`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique (auto-généré) |
| `form_id` | TEXT | Identifiant du formulaire (ex: "astro-contact") |
| `email` | TEXT | Email du contact |
| `name` | TEXT | Nom du contact (optionnel) |
| `message` | TEXT | Message du contact (optionnel) |
| `page_url` | TEXT | URL de la page d'origine (optionnel) |
| `referrer` | TEXT | Référent (optionnel) |
| `data` | JSONB | Champs dynamiques supplémentaires (optionnel) |
| `created_at` | TIMESTAMPTZ | Date de création (auto-généré) |

### Exemples de requêtes SQL

#### Voir toutes les soumissions

```sql
SELECT * FROM form_submissions
ORDER BY created_at DESC
LIMIT 10;
```

#### Filtrer par form_id

```sql
SELECT * FROM form_submissions
WHERE form_id = 'astro-contact'
ORDER BY created_at DESC;
```

#### Rechercher dans les données JSON

```sql
-- Trouver les soumissions avec un budget spécifique
SELECT * FROM form_submissions
WHERE data->>'budget' = '10000-25000';
```

#### Statistiques par formulaire

```sql
SELECT 
  form_id,
  COUNT(*) as total_submissions,
  COUNT(DISTINCT email) as unique_emails,
  MIN(created_at) as first_submission,
  MAX(created_at) as last_submission
FROM form_submissions
GROUP BY form_id;
```

---

## Déploiement sur Vercel

### Prérequis

- Compte GitHub
- Compte Vercel (gratuit)

### Méthode 1 : Via Dashboard Vercel (Recommandé)

#### 1. Préparer le code

```bash
# Vérifier que tout fonctionne en local
npm run build
npm start
```

#### 2. Push sur GitHub

```bash
git init
git add .
git commit -m "Initial commit - Contact Service API"
git remote add origin https://github.com/VOTRE_USERNAME/contact-service.git
git branch -M main
git push -u origin main
```

#### 3. Déployer sur Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Add New"** > **"Project"**
3. Sélectionnez votre repository GitHub
4. Vercel détecte automatiquement Next.js

#### 4. Configurer les variables d'environnement

Avant de déployer, ajoutez toutes les variables :

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
CONTACT_NOTIFICATION_EMAIL=notifications@votredomaine.com
CONTACT_ALLOWED_ORIGINS=https://votresite.com,https://www.votresite.com
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
```

5. Cliquez sur **"Deploy"**

#### 5. Vérifier le déploiement

```bash
# Tester le health check
curl https://votre-projet.vercel.app/api/health

# Voir la documentation
https://votre-projet.vercel.app/api-docs
```

### Méthode 2 : Via CLI Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Domaine personnalisé

1. Dans le dashboard Vercel : **Settings** > **Domains**
2. Ajoutez votre domaine : `contact-api.votredomaine.com`
3. Configurez les DNS chez votre registrar :

```
Type: CNAME
Name: contact-api
Value: cname.vercel-dns.com
TTL: 3600
```

4. Mettez à jour `CONTACT_ALLOWED_ORIGINS` avec votre nouveau domaine

---

## Sécurité

### Sécurité des Variables d'Environnement

**NE JAMAIS exposer côté client** :
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_USER` et `SMTP_PASS`

Ces variables sont utilisées uniquement côté serveur dans les Route Handlers Next.js.

### CORS

Configurez `CONTACT_ALLOWED_ORIGINS` avec uniquement vos domaines de confiance :

```env
CONTACT_ALLOWED_ORIGINS=https://site1.com,https://site2.com,https://site3.com
```

**Important** :
- Pas d'espaces après les virgules
- Inclure `https://` (pas `http://` en production)
- Inclure `www.` si votre site l'utilise

### Rate Limiting

Protection contre les abus :
- Limite par défaut : 10 requêtes par minute par IP
- Configurable via `RATE_LIMIT_MAX_REQUESTS`
- Implémentation en mémoire (suffisant pour débuter)

**Note** : Pour un usage production intensif, migrez vers Redis (Vercel KV ou Upstash).

### Validation

Toutes les données sont validées avec Zod :
- Format email vérifié
- Longueur max des messages : 5000 caractères
- Taille max du payload : 100KB
- Sanitization automatique des entrées

---

## Dépannage

### Problèmes courants

#### "SUPABASE_URL must be defined"

**Solution** : Vérifiez que `.env.local` existe et contient toutes les variables requises.

```bash
cp .env.example .env.local
# Puis éditez .env.local
```

#### Email non envoyé

**Solutions** :
1. Vérifiez que `SMTP_PASS` est un mot de passe d'application (16 caractères), pas votre mot de passe Gmail normal
2. Activez la validation en 2 étapes sur Gmail
3. Générez un nouveau mot de passe : https://myaccount.google.com/apppasswords
4. Vérifiez les logs dans le terminal

#### "Origin not allowed" (CORS)

**Solution** : Ajoutez votre domaine dans `CONTACT_ALLOWED_ORIGINS`

```env
CONTACT_ALLOWED_ORIGINS=http://localhost:3000,https://monsite.com
```

#### Rate limit dépassé en développement

**Solution** : Désactivez le rate limiting

```env
DISABLE_RATE_LIMIT=true
```

Ou augmentez la limite :

```env
RATE_LIMIT_MAX_REQUESTS=100
```

#### Port 3000 déjà utilisé

**Solution** : Changez le port

```bash
PORT=3001 npm run dev
```

#### Build échoue sur Vercel

**Solutions** :
```bash
# 1. Tester le build localement
npm run build

# 2. Vérifier les types TypeScript
npm run type-check

# 3. Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

#### Table Supabase inexistante

**Solution** :
1. Allez dans Supabase Dashboard
2. SQL Editor
3. Exécutez le contenu de `supabase-schema.sql`

### Logs et Debugging

#### Logs locaux

Les logs sont affichés avec des préfixes :
- `[Contact API]` - Route principale
- `[Supabase]` - Opérations DB
- `[Mailer]` - Envoi d'emails
- `[Validation]` - Erreurs de validation
- `[CORS]` - Requêtes bloquées
- `[RateLimit]` - Limites dépassées

#### Logs Vercel

Dans le dashboard Vercel :
- **Deployments** > **Function Logs** : Logs en temps réel
- **Runtime Logs** : Erreurs et warnings

#### Tester la connexion SMTP

Créez un fichier temporaire :

```javascript
// test-smtp.js
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Ready!');
  }
});
```

Exécutez :

```bash
node test-smtp.js
rm test-smtp.js
```

---

## Architecture Technique

### Structure du Projet

```
contact-service/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── contact/
│   │   │   │   └── route.ts      # Endpoint POST principal
│   │   │   └── health/
│   │   │       └── route.ts      # Health check
│   │   ├── api-docs/
│   │   │   └── page.tsx          # Interface Swagger UI
│   │   ├── layout.tsx            # Layout racine
│   │   └── page.tsx              # Redirection
│   ├── lib/
│   │   ├── supabaseClient.ts     # Client Supabase
│   │   ├── mailer.ts             # Configuration Nodemailer
│   │   ├── validation.ts         # Validation Zod
│   │   ├── cors.ts               # Gestion CORS
│   │   ├── rateLimit.ts          # Rate limiting
│   │   └── openapi.ts            # Spécification OpenAPI
│   └── types/
│       └── contact.ts            # Types TypeScript
├── supabase-schema.sql           # Schéma SQL
├── package.json
├── tsconfig.json
├── next.config.mjs
└── .env.example
```

### Flux de traitement d'une requête

```
1. Client envoie POST /api/contact
   ↓
2. Vérification CORS
   ↓
3. Rate limiting (10 req/min/IP)
   ↓
4. Validation des données (Zod)
   ↓
5. Insertion dans Supabase
   ↓
6. Envoi email (non-bloquant)
   ↓
7. Réponse 201 avec submission_id
```

### Dépendances principales

**Production** :
- `next` - Framework
- `react` - UI (minimal)
- `@supabase/supabase-js` - Client Supabase
- `nodemailer` - Envoi d'emails
- `zod` - Validation
- `swagger-ui-react` - Documentation

**Development** :
- `typescript` - Langage
- `@types/*` - Définitions de types
- `eslint` - Linter

### Performance

**Métriques cibles** :
- Temps de réponse médian : < 500ms
- P95 : < 1000ms
- Cold start : < 2s
- Uptime : > 99.9%

### Scripts npm

```bash
# Développement
npm run dev           # Lancer en mode dev

# Production
npm run build         # Build pour production
npm start             # Lancer le build

# Qualité de code
npm run lint          # Linter ESLint
npm run type-check    # Vérifier les types
```

---

## Support et Contribution

### Ressources

- Documentation Swagger : `/api-docs`
- GitHub Issues : Pour signaler des bugs
- GitHub Discussions : Pour poser des questions

### Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Committez vos changements (`git commit -m 'feat: ajout ma-feature'`)
4. Poussez vers la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

### Licence

MIT License - Libre d'utilisation pour projets personnels et commerciaux.

---

## Coûts (Plan Gratuit)

| Service | Plan Gratuit | Suffisant pour |
|---------|--------------|----------------|
| **Vercel** | 100 GB-Hrs compute, 100 GB bandwidth | Microservice contact |
| **Supabase** | 500 MB database, 1 GB transfer | ~500MB de soumissions |
| **Gmail SMTP** | 500 emails/jour | ~15,000 emails/mois |

**Total : 0€/mois** - Largement suffisant pour des formulaires de contact

---

**Version** : 1.0.1
**Dernière mise à jour** : 2024-11-22
**Made for developers**

# Guide de Déploiement - Contact Service API

Guide complet pour déployer le Contact Service API sur GitHub et Vercel avec CI/CD automatique.

---

## Table des Matières

1. [Prérequis](#prérequis)
2. [Déploiement sur GitHub](#déploiement-sur-github)
3. [Déploiement sur Vercel](#déploiement-sur-vercel)
4. [Configuration CI/CD](#configuration-cicd)
5. [Utilisation de l'API](#utilisation-de-lapi)
6. [Maintenance et Mises à Jour](#maintenance-et-mises-à-jour)

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un compte GitHub : https://github.com
- Un compte Vercel : https://vercel.com
- Git installé localement
- Credentials Supabase (URL + Service Role Key)
- Credentials SMTP (Gmail recommandé)

---

## Déploiement sur GitHub

### Étape 1 : Préparer le repository local

Ouvrez un terminal dans le dossier du projet :

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Contact Service API with Next.js, Supabase and Nodemailer"

# Renommer la branche en main
git branch -M main
```

### Étape 2 : Créer le repository sur GitHub

1. Allez sur https://github.com
2. Connectez-vous à votre compte
3. Cliquez sur le **+** en haut à droite
4. Sélectionnez **New repository**

**Configuration recommandée** :

```
Repository name: api-node-mailer-1
Description: Contact Service API - Microservice pour formulaires de contact avec Next.js, Supabase et Nodemailer
Visibility: Public (ou Private selon vos besoins)

NE PAS cocher :
☐ Add a README file
☐ Add .gitignore
☐ Choose a license
```

5. Cliquez sur **Create repository**

### Étape 3 : Connecter et pousser le code

GitHub affichera des instructions. Copiez l'URL de votre repository et exécutez :

```bash
# Remplacez par VOTRE URL GitHub
git remote add origin https://github.com/VOTRE_USERNAME/api-node-mailer-1.git

# Pousser le code
git push -u origin main
```

**Vérification** : Actualisez la page GitHub, vous devriez voir tous vos fichiers.

---

## Déploiement sur Vercel

### Étape 1 : Préparer les variables d'environnement

**IMPORTANT** : Préparez ces valeurs dans un fichier texte avant de déployer.

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...votre-key-complete...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
CONTACT_NOTIFICATION_EMAIL=votre-email@gmail.com
CONTACT_ALLOWED_ORIGINS=https://votre-projet.vercel.app
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
NODE_ENV=production
```

### Étape 2 : Connecter Vercel à GitHub

1. Allez sur https://vercel.com
2. Cliquez sur **Sign Up** ou **Log In**
3. Choisissez **Continue with GitHub**
4. Autorisez Vercel à accéder à vos repositories

### Étape 3 : Importer le projet

1. Sur le dashboard Vercel, cliquez sur **Add New...** > **Project**
2. Trouvez votre repository `api-node-mailer-1`
3. Cliquez sur **Import**

### Étape 4 : Configurer le projet

**Configuration détectée automatiquement** :

```
Framework Preset: Next.js
Root Directory: ./
Build Command: next build
Output Directory: .next
Install Command: npm install
```

**Ne modifiez rien**, Vercel détecte tout automatiquement.

### Étape 5 : Ajouter les variables d'environnement

**AVANT** de cliquer sur Deploy, déroulez la section **Environment Variables** :

1. Cliquez sur **Add New**
2. Ajoutez **UNE PAR UNE** chaque variable :

| Name | Value | Environment |
|------|-------|-------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production |
| `SMTP_HOST` | `smtp.gmail.com` | Production |
| `SMTP_PORT` | `587` | Production |
| `SMTP_USER` | `votre-email@gmail.com` | Production |
| `SMTP_PASS` | `xxxx xxxx xxxx xxxx` | Production |
| `CONTACT_NOTIFICATION_EMAIL` | `votre-email@gmail.com` | Production |
| `CONTACT_ALLOWED_ORIGINS` | (voir ci-dessous) | Production |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Production |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Production |
| `NODE_ENV` | `production` | Production |

**Pour CONTACT_ALLOWED_ORIGINS**, ajoutez vos domaines séparés par des virgules :
```
https://votre-site1.com,https://votre-site2.com,https://api-node-mailer-1.vercel.app
```

3. Vérifiez que **Production** est bien sélectionné pour chaque variable

### Étape 6 : Déployer

1. Cliquez sur **Deploy**
2. Attendez 2-3 minutes
3. Le déploiement affichera des logs en temps réel

**Succès** : Vous verrez un message "Congratulations!" avec votre URL.

### Étape 7 : Obtenir l'URL de l'API

Votre API sera disponible sur :
```
https://api-node-mailer-1.vercel.app
```

Ou un nom généré automatiquement par Vercel.

### Étape 8 : Tester le déploiement

**Test 1 : Health Check**

```bash
curl https://api-node-mailer-1.vercel.app/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "service": {
    "name": "contact-service",
    "version": "1.0.0"
  }
}
```

**Test 2 : Documentation**

Ouvrez dans votre navigateur :
```
https://api-node-mailer-1.vercel.app/api-docs
```

**Test 3 : Envoyer un formulaire**

```bash
curl -X POST https://api-node-mailer-1.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "form_id": "test",
    "email": "test@example.com",
    "name": "Test User",
    "message": "Test de déploiement Vercel"
  }'
```

---

## Configuration CI/CD

Le CI/CD est **automatique** avec Vercel + GitHub !

### Fonctionnement du CI/CD

```
1. Vous modifiez le code localement
   ↓
2. git add . && git commit -m "fix: ..."
   ↓
3. git push origin main
   ↓
4. GitHub déclenche automatiquement Vercel
   ↓
5. Vercel build et déploie automatiquement
   ↓
6. Nouveau déploiement disponible en 2-3 minutes
```

### Workflow de développement

#### Développement d'une nouvelle fonctionnalité

```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire vos modifications
# Éditez les fichiers...

# 3. Tester en local
npm run dev
# Vérifier sur http://localhost:3000

# 4. Commiter
git add .
git commit -m "feat: ajout de la nouvelle fonctionnalité"

# 5. Pousser la branche
git push origin feature/nouvelle-fonctionnalite
```

**Vercel créera automatiquement un déploiement de preview** :
- URL temporaire : `https://api-node-mailer-1-git-feature-nouvelle-fonctionnalite.vercel.app`
- Permet de tester sans affecter la production

#### Déploiement en production

```bash
# 1. Merger dans main (via Pull Request sur GitHub ou en local)
git checkout main
git merge feature/nouvelle-fonctionnalite

# 2. Pousser
git push origin main
```

**Vercel déploiera automatiquement en production** !

### Environnements Vercel

Vercel gère 3 environnements :

| Environnement | Branche | URL | Usage |
|---------------|---------|-----|-------|
| **Production** | `main` | `api-node-mailer-1.vercel.app` | Production |
| **Preview** | Autres branches | `api-...-git-branch.vercel.app` | Tests |
| **Development** | Local | `localhost:3000` | Développement |

### Voir les déploiements

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Onglet **Deployments** : Voir tous les déploiements

Chaque déploiement affiche :
- Commit associé
- Status (Success / Failed)
- Logs complets
- URL de preview

### Rollback (Retour en arrière)

Si un déploiement pose problème :

1. Dans Vercel Dashboard > **Deployments**
2. Trouvez un déploiement précédent qui fonctionnait
3. Cliquez sur **⋯** > **Promote to Production**

C'est instantané !

---

## Utilisation de l'API

### Depuis vos sites web

Une fois déployée, utilisez l'URL Vercel dans tous vos sites :

#### Exemple Astro

```javascript
const response = await fetch('https://api-node-mailer-1.vercel.app/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    form_id: 'mon-site-astro',
    email: formData.get('email'),
    name: formData.get('name'),
    message: formData.get('message'),
    page_url: window.location.href,
    referrer: document.referrer,
  }),
});

const result = await response.json();
console.log(result);
```

#### Exemple Next.js

```typescript
const response = await fetch('https://api-node-mailer-1.vercel.app/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    form_id: 'mon-site-nextjs',
    email: formData.email,
    name: formData.name,
    message: formData.message,
    page_url: window.location.href,
  }),
});
```

### Mettre à jour CORS

N'oubliez pas d'ajouter vos domaines dans `CONTACT_ALLOWED_ORIGINS` :

1. Vercel Dashboard > Votre projet
2. **Settings** > **Environment Variables**
3. Trouvez `CONTACT_ALLOWED_ORIGINS`
4. Cliquez sur **Edit**
5. Ajoutez vos domaines :
   ```
   https://site1.com,https://www.site1.com,https://site2.com
   ```
6. **Save**
7. Redéployez (Vercel le fait automatiquement après modification de variables)

---

## Maintenance et Mises à Jour

### Mettre à jour le code

```bash
# 1. Faire vos modifications
# Éditez les fichiers...

# 2. Tester localement
npm run dev

# 3. Commiter et pousser
git add .
git commit -m "fix: correction du bug X"
git push origin main
```

**Vercel déploiera automatiquement** en 2-3 minutes.

### Mettre à jour les variables d'environnement

1. Vercel Dashboard > Votre projet
2. **Settings** > **Environment Variables**
3. Modifiez la variable
4. **Save**
5. Redéployez si nécessaire

### Mettre à jour les dépendances

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Tester
npm run build
npm start

# Pousser
git add package.json package-lock.json
git commit -m "chore: mise à jour des dépendances"
git push origin main
```

### Monitoring

#### Logs en temps réel

1. Vercel Dashboard > Votre projet
2. **Deployments** > Dernier déploiement
3. **Runtime Logs** : Voir tous les logs

#### Métriques

1. Vercel Dashboard > Votre projet
2. **Analytics** : Trafic, temps de réponse, erreurs

#### Alertes

Configurez des alertes email dans **Settings** > **Notifications** pour :
- Déploiements échoués
- Erreurs en production
- Dépassement de quotas

---

## Domaine Personnalisé (Optionnel)

### Ajouter un domaine custom

1. Vercel Dashboard > Votre projet
2. **Settings** > **Domains**
3. Cliquez sur **Add**
4. Entrez votre domaine : `contact-api.votredomaine.com`
5. Vercel vous donnera des instructions DNS

**Configuration DNS chez votre registrar** :

```
Type: CNAME
Name: contact-api
Value: cname.vercel-dns.com
TTL: 3600
```

6. Attendez la propagation DNS (quelques minutes à 48h)
7. Vercel configurera automatiquement le SSL (Let's Encrypt)

### Utiliser le domaine custom

Une fois configuré, utilisez votre domaine :

```javascript
fetch('https://contact-api.votredomaine.com/api/contact', {
  method: 'POST',
  // ...
});
```

N'oubliez pas de mettre à jour `CONTACT_ALLOWED_ORIGINS` !

---

## Sécurité

### Checklist de sécurité

- [ ] Variables d'environnement configurées dans Vercel (pas dans le code)
- [ ] `CONTACT_ALLOWED_ORIGINS` contient uniquement vos domaines de confiance
- [ ] Service role key Supabase **jamais** exposée côté client
- [ ] SMTP credentials sécurisées (mot de passe d'application)
- [ ] Rate limiting activé
- [ ] HTTPS forcé (automatique avec Vercel)
- [ ] Monitoring activé

### Rotation des secrets

Changez régulièrement :

1. **Mot de passe SMTP** : Générez un nouveau mot de passe d'application Gmail
2. **Supabase Service Role Key** : Régénérez dans Supabase Dashboard
3. Mettez à jour dans Vercel > Environment Variables
4. Redéployez

---

## Troubleshooting

### Déploiement échoue

1. Vérifiez les logs dans Vercel Dashboard
2. Testez le build localement : `npm run build`
3. Vérifiez les erreurs TypeScript : `npm run type-check`

### API ne répond pas

1. Vérifiez le health check : `curl https://votre-url.vercel.app/api/health`
2. Vérifiez les variables d'environnement dans Vercel
3. Consultez les Runtime Logs

### CORS bloqué

1. Vérifiez que votre domaine est dans `CONTACT_ALLOWED_ORIGINS`
2. Format : `https://domaine.com` (pas de slash à la fin)
3. Redéployez après modification

### Emails non envoyés

1. Vérifiez les logs dans Vercel Dashboard
2. Vérifiez les credentials SMTP
3. Testez la connexion SMTP localement

---

## Ressources

- Documentation Vercel : https://vercel.com/docs
- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
- Support Vercel : https://vercel.com/support

---

**Version** : 1.0.0
**Dernière mise à jour** : 2024-11-22

Déploiement et CI/CD automatique avec GitHub + Vercel.


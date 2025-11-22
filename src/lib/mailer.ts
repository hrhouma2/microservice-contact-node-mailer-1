/**
 * Configuration et utilitaires Nodemailer pour l'envoi d'emails
 * 
 * Ce module gère l'envoi d'emails de notification via SMTP
 * lorsqu'un formulaire de contact est soumis.
 */

import nodemailer, { Transporter } from 'nodemailer';
import type { ContactPayload } from '@/types/contact';

// Validation des variables d'environnement
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const notificationEmail = process.env.CONTACT_NOTIFICATION_EMAIL;

if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !notificationEmail) {
  console.warn(
    '[Mailer] ATTENTION: Configuration SMTP incomplète. Les emails ne seront pas envoyés.'
  );
}

// Création du transporteur SMTP
let transporter: Transporter | null = null;

/**
 * Initialise le transporteur Nodemailer
 */
function getTransporter(): Transporter {
  if (!transporter && smtpHost && smtpPort && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // true pour port 465, false pour autres
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    console.log('[Mailer] Transporteur SMTP initialisé:', smtpHost);
  }

  if (!transporter) {
    throw new Error('Configuration SMTP incomplète');
  }

  return transporter;
}

/**
 * Génère le contenu HTML de l'email de notification
 * 
 * @param payload - Données du formulaire de contact
 * @returns HTML formaté pour l'email
 */
function generateEmailHTML(payload: ContactPayload): string {
  const dataJSON = payload.data 
    ? JSON.stringify(payload.data, null, 2) 
    : 'Aucune donnée supplémentaire';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouveau message de contact</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4F46E5;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 20px;
          border: 1px solid #e5e7eb;
        }
        .field {
          margin-bottom: 15px;
        }
        .field-label {
          font-weight: bold;
          color: #4F46E5;
          display: block;
          margin-bottom: 5px;
        }
        .field-value {
          background-color: white;
          padding: 10px;
          border-left: 3px solid #4F46E5;
          word-wrap: break-word;
        }
        .data-block {
          background-color: #1f2937;
          color: #10b981;
          padding: 15px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0;">📬 Nouveau message de contact</h1>
      </div>
      <div class="content">
        <div class="field">
          <span class="field-label">📋 Formulaire ID:</span>
          <div class="field-value">${payload.form_id}</div>
        </div>
        
        <div class="field">
          <span class="field-label">📧 Email:</span>
          <div class="field-value"><a href="mailto:${payload.email}">${payload.email}</a></div>
        </div>
        
        ${payload.name ? `
        <div class="field">
          <span class="field-label">👤 Nom:</span>
          <div class="field-value">${payload.name}</div>
        </div>
        ` : ''}
        
        ${payload.message ? `
        <div class="field">
          <span class="field-label">💬 Message:</span>
          <div class="field-value">${payload.message.replace(/\n/g, '<br>')}</div>
        </div>
        ` : ''}
        
        ${payload.page_url ? `
        <div class="field">
          <span class="field-label">🔗 Page URL:</span>
          <div class="field-value"><a href="${payload.page_url}" target="_blank">${payload.page_url}</a></div>
        </div>
        ` : ''}
        
        ${payload.referrer ? `
        <div class="field">
          <span class="field-label">🔙 Référent:</span>
          <div class="field-value">${payload.referrer}</div>
        </div>
        ` : ''}
        
        ${payload.data && Object.keys(payload.data).length > 0 ? `
        <div class="field">
          <span class="field-label">📊 Données supplémentaires (JSON):</span>
          <div class="data-block">${dataJSON}</div>
        </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p>Email envoyé automatiquement par le Contact Service API</p>
        <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'America/Toronto' })}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Génère le contenu texte de l'email de notification
 * 
 * @param payload - Données du formulaire de contact
 * @returns Texte brut pour l'email
 */
function generateEmailText(payload: ContactPayload): string {
  let text = `Nouveau message de contact\n\n`;
  text += `Formulaire ID: ${payload.form_id}\n`;
  text += `Email: ${payload.email}\n`;
  
  if (payload.name) text += `Nom: ${payload.name}\n`;
  if (payload.message) text += `\nMessage:\n${payload.message}\n`;
  if (payload.page_url) text += `\nPage URL: ${payload.page_url}\n`;
  if (payload.referrer) text += `Référent: ${payload.referrer}\n`;
  
  if (payload.data && Object.keys(payload.data).length > 0) {
    text += `\nDonnées supplémentaires:\n`;
    text += JSON.stringify(payload.data, null, 2);
  }
  
  text += `\n\n---\nEmail envoyé automatiquement par le Contact Service API\n`;
  text += `Date: ${new Date().toISOString()}\n`;
  
  return text;
}

/**
 * Envoie un email de notification pour une soumission de contact
 * 
 * @param payload - Données du formulaire de contact
 * @returns Promise qui se résout quand l'email est envoyé
 * @throws Error si l'envoi échoue
 */
export async function sendContactNotification(
  payload: ContactPayload
): Promise<void> {
  try {
    if (!notificationEmail) {
      throw new Error('CONTACT_NOTIFICATION_EMAIL non défini');
    }

    const transport = getTransporter();

    const mailOptions = {
      from: `"Contact Service" <${smtpUser}>`,
      to: notificationEmail,
      subject: `[${payload.form_id}] Nouveau message de ${payload.email}`,
      text: generateEmailText(payload),
      html: generateEmailHTML(payload),
      replyTo: payload.email,
    };

    console.log('[Mailer] Envoi de l\'email de notification...');
    
    const info = await transport.sendMail(mailOptions);
    
    console.log('[Mailer] Email envoyé avec succès:', info.messageId);
  } catch (error) {
    console.error('[Mailer] Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Échec de l'envoi de l'email: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Vérifie la configuration SMTP (utile pour le health check)
 * 
 * @returns true si la configuration est valide, false sinon
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return false;
    }

    const transport = getTransporter();
    await transport.verify();
    console.log('[Mailer] Connexion SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    console.error('[Mailer] Échec de la vérification SMTP:', error);
    return false;
  }
}


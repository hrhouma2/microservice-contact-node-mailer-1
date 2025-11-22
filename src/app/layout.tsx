/**
 * Root Layout pour l'application Next.js
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Service API',
  description: 'Microservice API pour gérer des formulaires de contact multi-sites',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}


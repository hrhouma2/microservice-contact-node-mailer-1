/**
 * Page d'accueil du service
 * 
 * Page simple qui redirige vers la documentation de l'API
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirection automatique vers la documentation
  redirect('/api-docs');
}


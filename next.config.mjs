/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration optimisée pour un microservice API-only
  // Note: StrictMode désactivé pour éviter les warnings de swagger-ui-react
  // qui utilise des lifecycle methods dépréciés (UNSAFE_componentWillReceiveProps)
  reactStrictMode: false,
  
  // Désactiver le telemetry Next.js (optionnel)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb', // Limite de taille des requêtes
    },
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },

  // Optimisations pour déploiement Vercel
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;


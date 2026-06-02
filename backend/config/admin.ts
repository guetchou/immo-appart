export default ({ env }: { env: any }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps:       env.bool('FLAG_NPS',       true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },

  // ── Preview (Draft Mode) ───────────────────────────────
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL', 'http://localhost:3000'),

      async handler(uid: string, { documentId, locale, status }: { documentId: string; locale?: string; status: string }) {
        // Mapping UID → chemin frontend
        const getPreviewPath = async (uid: string, documentId: string): Promise<string | null> => {
          if (uid === 'api::appartement.appartement') {
            const doc = await (strapi as any).documents(uid).findOne({
              documentId,
              fields: ['slug'],
            });
            if (!doc?.slug) return null;
            return `/appartements/${doc.slug}`;
          }

          if (uid === 'api::homepage.homepage')            return '/';
          if (uid === 'api::service-premium.service-premium') {
            const doc = await (strapi as any).documents(uid).findOne({
              documentId,
              fields: ['slug'],
            });
            return doc?.slug ? `/services/${doc.slug}` : null;
          }
          if (uid === 'api::publication-sociale.publication-sociale') return null;
          if (uid === 'api::navigation.navigation')        return '/';
          if (uid === 'api::footer-config.footer-config')  return '/';
          if (uid === 'api::reseaux-sociaux.reseaux-sociaux') return '/';

          return null;
        };

        const pathname = await getPreviewPath(uid, documentId);
        if (!pathname) return null;

        const clientUrl  = env('CLIENT_URL',      'http://localhost:3000');
        const secret     = env('PREVIEW_SECRET',  '');
        const baseParams = new URLSearchParams({
          secret,
          documentId,
          status,
          uid,
          ...(locale ? { locale } : {}),
        });

        // Route Next.js Draft Mode
        return `${clientUrl}/api/preview?${baseParams}&redirect=${encodeURIComponent(pathname)}`;
      },
    },
  },
});

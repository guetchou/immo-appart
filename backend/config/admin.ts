import { createHmac } from 'crypto'

// ── Token HMAC signé — expire dans TTL_MS ─────────────────────────
const TTL_MS = 5 * 60 * 1000 // 5 minutes

function buildPreviewToken(secret: string, documentId: string, uid: string, status: string): string {
  const exp     = Date.now() + TTL_MS
  const payload = `${documentId}.${uid}.${status}.${exp}`
  const hmac    = createHmac('sha256', secret).update(payload).digest('hex')
  return `${hmac}.${exp}`
}

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

  // ── Preview (Draft Mode) ───────────────────────────────────────
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL', 'http://localhost:3000'),

      async handler(uid: string, { documentId, locale, status }: { documentId: string; locale?: string; status: string }) {

        // Mapping UID → chemin frontend
        const getPreviewPath = async (uid: string, documentId: string): Promise<string | null> => {
          if (uid === 'api::appartement.appartement') {
            const doc = await (strapi as any).documents(uid).findOne({ documentId, fields: ['slug'] })
            if (!doc?.slug) return null
            return `/appartements/${doc.slug}`
          }
          if (uid === 'api::homepage.homepage')               return '/'
          if (uid === 'api::navigation.navigation')            return '/'
          if (uid === 'api::footer-config.footer-config')      return '/'
          if (uid === 'api::reseaux-sociaux.reseaux-sociaux')  return '/'
          if (uid === 'api::service-premium.service-premium') {
            const doc = await (strapi as any).documents(uid).findOne({ documentId, fields: ['slug'] })
            return doc?.slug ? `/services/${doc.slug}` : null
          }
          return null // pas de page frontend pour ce type
        }

        const pathname = await getPreviewPath(uid, documentId)
        if (!pathname) return null

        const clientUrl     = env('CLIENT_URL',     'http://localhost:3000')
        const previewSecret = env('PREVIEW_SECRET', '')

        // Token HMAC à durée limitée — le secret brut n'apparaît pas dans l'URL
        const token = buildPreviewToken(previewSecret, documentId, uid, status)

        const params = new URLSearchParams({
          token,
          documentId,
          uid,
          status,
          ...(locale ? { locale } : {}),
        })

        return `${clientUrl}/api/preview?${params}&redirect=${encodeURIComponent(pathname)}`
      },
    },
  },
})

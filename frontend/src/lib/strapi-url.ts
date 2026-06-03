const STRAPI_PUBLIC_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const INTERNAL_STRAPI_HOSTS = new Set(['localhost:1337', '127.0.0.1:1337', '160.113.0.124:1337', '5.196.22.149:1337'])

export function toStrapiPublicUrl(url?: string | null) {
  if (!url) return null

  if (!url.startsWith('http')) {
    return `${STRAPI_PUBLIC_URL}${url}`
  }

  try {
    const parsed = new URL(url)
    if (INTERNAL_STRAPI_HOSTS.has(parsed.host)) {
      return `${STRAPI_PUBLIC_URL}${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {
    return url
  }

  return url
}

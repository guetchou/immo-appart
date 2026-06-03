const DEFAULT_STRAPI_URL = 'http://localhost:1337'

export const STRAPI_PUBLIC_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? DEFAULT_STRAPI_URL

export const STRAPI_SERVER_URL =
  process.env.STRAPI_INTERNAL_URL ??
  process.env.STRAPI_URL ??
  STRAPI_PUBLIC_URL

const INTERNAL_STRAPI_HOSTS = new Set(['localhost:1337', '127.0.0.1:1337', '160.113.0.124:1337', '5.196.22.149:1337'])

export function strapiPublicUrl(url?: string | null) {
  if (!url) return null
  if (!url.startsWith('http')) return `${STRAPI_PUBLIC_URL}${url}`

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

function normalizeStrapiUrls<T>(value: T): T {
  if (typeof value === 'string') {
    return strapiPublicUrl(value) as T
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeStrapiUrls(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeStrapiUrls(item)])
    ) as T
  }

  return value
}

export async function readJsonResponse<T>(res: Response, context: string): Promise<T> {
  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()

  if (!contentType.toLowerCase().includes('application/json')) {
    const preview = text.replace(/\s+/g, ' ').trim().slice(0, 160)
    throw new Error(
      `${context} returned ${res.status} ${res.statusText} with ${contentType || 'unknown content-type'} instead of JSON: ${preview}`
    )
  }

  try {
    return normalizeStrapiUrls(JSON.parse(text) as T)
  } catch (err) {
    throw new Error(`${context} returned invalid JSON: ${(err as Error).message}`)
  }
}

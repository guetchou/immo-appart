const DEFAULT_STRAPI_URL = 'http://localhost:1337'

export const STRAPI_PUBLIC_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? DEFAULT_STRAPI_URL

export const STRAPI_SERVER_URL =
  process.env.STRAPI_INTERNAL_URL ??
  process.env.STRAPI_URL ??
  STRAPI_PUBLIC_URL

export function strapiPublicUrl(url?: string | null) {
  if (!url) return null
  return url.startsWith('http') ? url : `${STRAPI_PUBLIC_URL}${url}`
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
    return JSON.parse(text) as T
  } catch (err) {
    throw new Error(`${context} returned invalid JSON: ${(err as Error).message}`)
  }
}

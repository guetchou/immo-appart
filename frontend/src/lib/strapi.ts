const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  tags?: string[]
  revalidate?: number
}

export async function strapiRequest<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, tags, revalidate = 60 } = options

  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    next: { tags, revalidate },
  })

  if (!res.ok) {
    throw new Error(`Strapi ${method} ${path} → ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Helpers REST standards
export const strapi = {
  get: <T>(path: string, opts?: Omit<FetchOptions, 'method'>) =>
    strapiRequest<T>(path, { ...opts, method: 'GET' }),

  post: <T>(path: string, body: unknown, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    strapiRequest<T>(path, { ...opts, method: 'POST', body }),

  put: <T>(path: string, body: unknown, opts?: Omit<FetchOptions, 'method' | 'body'>) =>
    strapiRequest<T>(path, { ...opts, method: 'PUT', body }),
}

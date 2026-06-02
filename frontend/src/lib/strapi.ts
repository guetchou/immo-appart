import { draftMode } from 'next/headers'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

type FetchOptions = {
  method?:     'GET' | 'POST' | 'PUT' | 'DELETE'
  body?:       unknown
  tags?:       string[]
  revalidate?: number
  preview?:    boolean   // forcer le mode preview
}

export async function strapiRequest<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, tags, revalidate = 60 } = options

  // Draft Mode — si Next.js est en preview, on demande les brouillons à Strapi
  let isPreview = options.preview ?? false
  try {
    const draft = await draftMode()
    if (draft.isEnabled) isPreview = true
  } catch {
    // draftMode() non disponible hors Server Components — ignorer
  }

  // Ajouter status=draft si en preview (nécessite un token Strapi avec droits)
  const url = new URL(`${STRAPI_URL}/api${path}`)
  if (isPreview) url.searchParams.set('status', 'draft')

  const res = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      ...(isPreview    ? { 'strapi-encode-source-maps': 'true' }    : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    next: { tags, revalidate: isPreview ? 0 : revalidate },
  })
  if (!res.ok) throw new Error(`Strapi ${method} ${path} → ${res.status}`)
  return res.json()
}

// ── Helpers Single Types ─────────────────────────────
export async function getHomepage() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>('/homepage', { revalidate: 120, tags: ['homepage'] })
    return r.data
  } catch { return null }
}

export async function getNavigation() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>('/navigation', { revalidate: 300, tags: ['navigation'] })
    return r.data
  } catch { return null }
}

export async function getFooterConfig() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>('/footer-config', { revalidate: 300, tags: ['footer'] })
    return r.data
  } catch { return null }
}

export async function getReseauxSociaux() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>('/reseaux-sociaux', { revalidate: 120, tags: ['reseaux'] })
    return r.data
  } catch { return null }
}

// ── Helpers Collections ──────────────────────────────
export async function getAppartements(params = '') {
  try {
    const r = await strapiRequest<{ data: unknown[]; meta: unknown }>(`/appartements${params}`, { revalidate: 60, tags: ['appartements'] })
    return r.data
  } catch { return [] }
}

export async function getPublicationsSociales() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>('/publications-sociales?filters[actif][$eq]=true&sort=ordre:desc&pagination[pageSize]=12', { revalidate: 60, tags: ['publications'] })
    return r.data
  } catch { return [] }
}

export async function getServicesPremium() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>('/services-premium?filters[disponible][$eq]=true', { revalidate: 300, tags: ['services'] })
    return r.data
  } catch { return [] }
}

// ── URL image Strapi ─────────────────────────────────
export function strapiImgUrl(url?: string | null) {
  if (!url) return null
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`
}

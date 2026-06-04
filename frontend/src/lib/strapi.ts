import { draftMode } from 'next/headers'
import { STRAPI_PUBLIC_URL, STRAPI_SERVER_URL, readJsonResponse } from './strapi-server'

const STRAPI_URL   = STRAPI_SERVER_URL
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''
const IS_DEV       = process.env.NODE_ENV === 'development'

type FetchOptions = {
  method?:     'GET' | 'POST' | 'PUT' | 'DELETE'
  body?:       unknown
  tags?:       string[]
  revalidate?: number
  preview?:    boolean
}

export async function strapiRequest<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, tags, revalidate = 60 } = options

  // Draft Mode — brouillons Strapi si preview activé
  let isPreview = options.preview ?? false
  try {
    const draft = await draftMode()
    if (draft.isEnabled) isPreview = true
  } catch {
    // draftMode() indisponible hors Server Components
  }

  const url = new URL(`${STRAPI_URL}/api${path}`)
  if (isPreview) url.searchParams.set('status', 'draft')

  let res: Response
  try {
    res = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
        ...(isPreview    ? { 'strapi-encode-source-maps': 'true' }    : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      // Dev : no-store → toujours frais
      // Preview : no-store → brouillon immédiat
      // Production : ISR + revalidation webhook
      ...(IS_DEV || isPreview
        ? { cache: 'no-store' as const }
        : { next: { tags, revalidate } }
      ),
    })
  } catch (networkErr) {
    throw new Error(`Strapi inaccessible (${STRAPI_URL}${path}) — vérifiez que Strapi tourne sur :1337`)
  }

  if (!res.ok) {
    throw new Error(`Strapi ${method} ${path} → ${res.status} ${res.statusText}`)
  }
  return readJsonResponse<T>(res, `Strapi ${method} ${path}`)
}

// ── Single Types ─────────────────────────────────────
export async function getHomepage() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/homepage?populate=hero_image', { revalidate: 30, tags: ['homepage'] }
    )
    return r.data
  } catch { return null }
}

export async function getNavigation() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/navigation?populate[0]=logo_image&populate[1]=agent_photo', { revalidate: 60, tags: ['navigation'] }
    )
    return r.data
  } catch { return null }
}

export async function getFooterConfig() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/footer-config', { revalidate: 60, tags: ['footer'] }
    )
    return r.data
  } catch { return null }
}

export async function getReseauxSociaux() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/reseaux-sociaux', { revalidate: 30, tags: ['reseaux'] }
    )
    return r.data
  } catch { return null }
}

export async function getPageAPropos() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/page-a-propos', { revalidate: 60, tags: ['page-a-propos'] }
    )
    return r.data
  } catch { return null }
}

export async function getPagePaiement() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/page-paiement', { revalidate: 60, tags: ['page-paiement'] }
    )
    return r.data
  } catch { return null }
}

export async function getPageReglement() {
  try {
    const r = await strapiRequest<{ data: Record<string, unknown> }>(
      '/page-reglement', { revalidate: 60, tags: ['page-reglement'] }
    )
    return r.data
  } catch { return null }
}

// ── Collections ──────────────────────────────────────
export async function getAppartements(params = '') {
  try {
    const r = await strapiRequest<{ data: unknown[]; meta: unknown }>(
      `/appartements${params}`, { revalidate: 30, tags: ['appartements'] }
    )
    return r.data
  } catch { return [] }
}

export async function getPublicationsSociales() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>(
      '/publications-sociales?filters[actif][$eq]=true&sort=ordre:desc&pagination[pageSize]=12',
      { revalidate: 30, tags: ['publications'] }
    )
    return r.data
  } catch { return [] }
}

export async function getServicesPremium() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>(
      '/services-premium?filters[disponible][$eq]=true&populate[0]=categorie_ref&sort=createdAt:asc&pagination[pageSize]=8',
      { revalidate: 60, tags: ['services'] }
    )
    return r.data
  } catch { return [] }
}

export async function getAvis() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>(
      '/avis?filters[en_vedette][$eq]=true&filters[verifie][$eq]=true&sort=createdAt:desc&pagination[pageSize]=6',
      { revalidate: 60, tags: ['avis'] }
    )
    return r.data
  } catch { return [] }
}

export async function getPolitiquesAnnulation() {
  try {
    const r = await strapiRequest<{ data: unknown[] }>(
      '/politiques-annulation?filters[actif][$eq]=true&sort=ordre_affichage:asc&pagination[pageSize]=20',
      { revalidate: 60, tags: ['politiques-annulation'] }
    )
    return r.data
  } catch { return [] }
}

// ── URL image Strapi ─────────────────────────────────
export function strapiImgUrl(url?: string | null) {
  if (!url) return null
  return url.startsWith('http') ? url : `${STRAPI_PUBLIC_URL}${url}`
}

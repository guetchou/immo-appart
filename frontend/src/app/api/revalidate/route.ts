/**
 * POST /api/revalidate
 * Reçoit les webhooks Strapi et invalide le cache Next.js correspondant.
 *
 * Payload Strapi (format officiel) :
 * {
 *   "event":     "entry.publish",
 *   "createdAt": "2026-06-02T10:00:00.000Z",
 *   "model":     "appartement",          ← nom singulier du content-type
 *   "uid":       "api::appartement.appartement",
 *   "entry":     { ...champs... }
 * }
 *
 * Sécurité : Strapi envoie Authorization: Bearer {REVALIDATION_SECRET}
 * (à configurer dans Strapi Admin → Settings → Webhooks → Headers)
 */

import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse }     from 'next/server'
import { timingSafeEqual }               from 'crypto'

// ── Mapping model Strapi → tags Next.js ─────────────────────────
// "model" = nom singulier du content-type (champ dans le payload webhook)
const MODEL_TO_TAGS: Record<string, string[]> = {
  'appartement':         ['appartements'],
  'avis':                ['appartements'],        // les avis impactent les fiches
  'reservation':         ['appartements'],
  'service-premium':     ['services'],
  'homepage':            ['homepage'],
  'navigation':          ['navigation'],
  'footer-config':       ['footer'],
  'reseaux-sociaux':     ['reseaux'],
  'publication-sociale': ['publications'],
}

// Événements qui justifient une revalidation
const REVALIDATE_EVENTS = new Set([
  'entry.create',
  'entry.update',
  'entry.delete',
  'entry.publish',
  'entry.unpublish',
  'media.update',
  'media.delete',
])

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET ?? ''

  // 1. Vérification du token Bearer — comparaison en temps constant (anti timing-attack)
  if (secret) {
    const auth     = request.headers.get('authorization') ?? ''
    const provided = auth.replace(/^Bearer\s+/i, '').trim()

    const a = Buffer.from(provided)
    const b = Buffer.from(secret)
    const invalid = a.length !== b.length || !timingSafeEqual(a, b)

    if (invalid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  // 2. Parse du payload
  let payload: {
    event?:  string
    model?:  string
    uid?:    string
    entry?:  Record<string, unknown>
  } = {}

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide' }, { status: 400 })
  }

  const event = payload.event ?? ''
  const model = payload.model ?? ''

  // 3. Ignorer les événements non pertinents (media.create, review-workflows, etc.)
  if (!REVALIDATE_EVENTS.has(event)) {
    return NextResponse.json({ message: 'Événement ignoré', event })
  }

  // 4. Résoudre les tags à invalider
  const tags = MODEL_TO_TAGS[model] ?? []

  if (tags.length === 0) {
    return NextResponse.json({ message: 'Modèle non géré', model })
  }

  // 5. Invalider les tags Next.js
  for (const tag of tags) {
    revalidateTag(tag)
  }

  // 6. Revalider aussi la page d'accueil si contenu global
  const globalModels = ['homepage', 'navigation', 'footer-config', 'reseaux-sociaux']
  if (globalModels.includes(model)) {
    revalidatePath('/', 'page')
  }

  console.log(`[webhook] ${event} on "${model}" → revalidated tags: [${tags.join(', ')}]`)

  return NextResponse.json({
    revalidated: true,
    event,
    model,
    tags,
    timestamp: new Date().toISOString(),
  })
}

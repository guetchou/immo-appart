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
  'type-logement':       ['appartements'],
  'avis':                ['appartements'],        // les avis impactent les fiches
  'reservation':         ['appartements'],
  'service-premium':     ['services'],
  'categorie-service':   ['services'],
  'politique-annulation': ['appartements', 'politiques-annulation'],
  'equipement':          ['appartements'],
  'categorie-equipement': ['appartements'],
  'homepage':            ['homepage'],
  'navigation':          ['navigation'],
  'footer-config':       ['footer'],
  'site-config':         ['site-config'],
  'catalogue-config':    ['catalogue-config', 'appartements'],
  'chat-config':         ['chat-config'],
  'detail-appartement-config': ['detail-appartement-config', 'appartements'],
  'reseaux-sociaux':     ['reseaux'],
  'publication-sociale': ['publications'],
  'page-a-propos':      ['page-a-propos'],
  'page-paiement':      ['page-paiement'],
  'page-reglement':     ['page-reglement'],
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

  // 1. Parse du payload d'abord (pour détecter trigger-test avant l'auth)
  let payload: {
    event?:  string
    model?:  string
    uid?:    string
    entry?:  Record<string, unknown>
  } = {}

  try {
    const text = await request.text()
    payload = text ? JSON.parse(text) : {}
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide' }, { status: 400 })
  }

  const event = payload.event ?? ''
  const model = payload.model ?? ''

  // 2. Le "trigger-test" Strapi est un simple ping de connectivité — pas d'auth requise
  if (event === 'trigger-test') {
    return NextResponse.json({ ok: true, message: 'Webhook opérationnel', event })
  }

  // 3. Vérification du token Bearer — comparaison en temps constant (anti timing-attack)
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

  // 4. Ignorer les événements non pertinents (media.create, review-workflows, etc.)
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
  const globalModels = ['homepage', 'navigation', 'footer-config', 'site-config', 'catalogue-config', 'chat-config', 'detail-appartement-config', 'reseaux-sociaux', 'page-a-propos', 'page-paiement', 'page-reglement', 'politique-annulation']
  if (globalModels.includes(model)) {
    revalidatePath('/', 'page')
  }
  if (model === 'site-config') {
    revalidatePath('/', 'layout')
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

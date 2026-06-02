import { revalidateTag, revalidatePath } from 'next/cache'
import { NextRequest, NextResponse }    from 'next/server'
import { createHmac, timingSafeEqual }  from 'crypto'

// Mapping UID Strapi → tags Next.js à invalider
const UID_TO_TAGS: Record<string, string[]> = {
  'api::appartement.appartement':             ['appartements'],
  'api::avis.avis':                           ['appartements'],
  'api::reservation.reservation':             ['appartements'],
  'api::service-premium.service-premium':     ['services'],
  'api::homepage.homepage':                   ['homepage'],
  'api::navigation.navigation':               ['navigation'],
  'api::footer-config.footer-config':         ['footer'],
  'api::reseaux-sociaux.reseaux-sociaux':     ['reseaux'],
  'api::publication-sociale.publication-sociale': ['publications'],
}

// Vérification de la signature HMAC-SHA256 du webhook Strapi
function verifySignature(body: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false
  const expected = createHmac('sha256', secret).update(body).digest('hex')
  try {
    return timingSafeEqual(
      Buffer.from(signature.replace('sha256=', ''), 'hex'),
      Buffer.from(expected, 'hex'),
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const secret    = process.env.REVALIDATION_SECRET ?? ''
  const signature = request.headers.get('x-strapi-signature') ?? ''
  const rawBody   = await request.text()

  // Vérifier la signature Strapi (si configurée)
  if (secret && !verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let payload: { model?: string; uid?: string; event?: string } = {}
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 })
  }

  const uid   = payload.uid ?? payload.model ?? ''
  const event = payload.event ?? ''

  // N'invalider que sur les événements de publication
  const relevantEvents = [
    'entry.publish', 'entry.unpublish', 'entry.update', 'entry.delete', 'entry.create',
  ]
  if (!relevantEvents.includes(event)) {
    return NextResponse.json({ message: 'Événement ignoré', event })
  }

  const tags = UID_TO_TAGS[uid] ?? []

  if (tags.length === 0) {
    return NextResponse.json({ message: 'UID non géré', uid })
  }

  // Invalider les tags correspondants
  for (const tag of tags) {
    revalidateTag(tag)
  }

  // Invalider aussi la page d'accueil si contenu global modifié
  if (['navigation', 'footer', 'homepage', 'reseaux'].some(t => tags.includes(t))) {
    revalidatePath('/', 'page')
  }

  return NextResponse.json({
    revalidated: true,
    uid,
    event,
    tags,
    timestamp: new Date().toISOString(),
  })
}

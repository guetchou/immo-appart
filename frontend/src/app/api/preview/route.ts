import { draftMode }  from 'next/headers'
import { redirect }   from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

// ── Validation redirection — aucun chemin vers l'extérieur ────────
function isSafeRedirectPath(raw: string): boolean {
  try {
    // Parse relative au placeholder : l'origine doit rester le placeholder.
    const parsed = new URL(raw, 'http://placeholder.invalid')
    return parsed.origin === 'http://placeholder.invalid'
  } catch {
    return false
  }
}

// ── Vérification HMAC — token signé {hmac}.{exp} ─────────────────
function verifyToken(
  token: string,
  secret: string,
  documentId: string,
  uid: string,
  status: string,
): boolean {
  const dotIdx = token.lastIndexOf('.')
  if (dotIdx === -1) return false

  const hmacHex = token.slice(0, dotIdx)
  const expStr  = token.slice(dotIdx + 1)
  const exp     = parseInt(expStr, 10)

  // Token expiré
  if (Number.isNaN(exp) || Date.now() > exp) return false

  // Recalculer le HMAC attendu
  const payload  = `${documentId}.${uid}.${status}.${exp}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')

  // Comparaison en temps constant (anti timing-attack)
  try {
    return timingSafeEqual(Buffer.from(hmacHex, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const token      = searchParams.get('token')      ?? ''
  const documentId = searchParams.get('documentId') ?? ''
  const uid        = searchParams.get('uid')        ?? ''
  const status     = searchParams.get('status')     ?? 'draft'
  const redirectTo = searchParams.get('redirect')   ?? '/'

  const previewSecret = process.env.PREVIEW_SECRET ?? ''

  // 1. Vérification HMAC (token à durée limitée, pas le secret brut)
  if (!previewSecret || !verifyToken(token, previewSecret, documentId, uid, status)) {
    return new Response('Token invalide ou expiré', { status: 401 })
  }

  // 2. Validation stricte du chemin de redirection
  if (!isSafeRedirectPath(redirectTo)) {
    return new Response('URL de redirection invalide', { status: 400 })
  }

  // 3. Activer/désactiver le Draft Mode Next.js
  const draft = await draftMode()
  if (status === 'published') {
    draft.disable()
  } else {
    draft.enable()
  }

  // 4. Empêcher la fuite du token via Referer
  const response = NextResponse.redirect(
    new URL(redirectTo, request.nextUrl.origin)
  )
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

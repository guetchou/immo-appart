import { NextRequest, NextResponse } from 'next/server'
import { STRAPI_SERVER_URL, readJsonResponse } from '@/lib/strapi-server'

const STRAPI = STRAPI_SERVER_URL

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json()
  if (!identifier || !password)
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })

  const res = await fetch(`${STRAPI}/api/auth/local`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ identifier, password }),
  })
  const data = await readJsonResponse<{ jwt?: string; user?: unknown; error?: { message?: string } }>(
    res,
    'Strapi auth login'
  )

  if (!res.ok)
    return NextResponse.json(
      { error: data?.error?.message ?? 'Identifiants incorrects' },
      { status: res.status }
    )

  if (!data.jwt) {
    return NextResponse.json({ error: 'Réponse Strapi invalide: JWT manquant' }, { status: 502 })
  }

  // Stocker le JWT dans un cookie httpOnly
  const response = NextResponse.json({ user: data.user })
  response.cookies.set('ndombi_jwt', data.jwt, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30, // 30 jours
    path:     '/',
  })
  return response
}

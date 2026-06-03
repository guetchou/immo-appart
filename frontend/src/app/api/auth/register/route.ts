import { NextRequest, NextResponse } from 'next/server'
import { STRAPI_SERVER_URL, readJsonResponse } from '@/lib/strapi-server'

const STRAPI = STRAPI_SERVER_URL

export async function POST(req: NextRequest) {
  const { username, email, password, prenom, nom, telephone } = await req.json()
  if (!email || !password || !prenom || !nom)
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })

  const res = await fetch(`${STRAPI}/api/auth/local/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      username: username || email,
      email,
      password,
      // Champs profil supplémentaires — stockés si le modèle User les accepte
      prenom,
      nom,
      telephone: telephone || '',
    }),
  })
  const data = await readJsonResponse<{ jwt?: string; user?: unknown; error?: { message?: string } }>(
    res,
    'Strapi auth register'
  )

  if (!res.ok)
    return NextResponse.json(
      { error: data?.error?.message ?? 'Erreur inscription' },
      { status: res.status }
    )

  if (!data.jwt) {
    return NextResponse.json({ error: 'Réponse Strapi invalide: JWT manquant' }, { status: 502 })
  }

  // Connexion automatique après inscription
  const response = NextResponse.json({ user: data.user })
  response.cookies.set('ndombi_jwt', data.jwt, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })
  return response
}

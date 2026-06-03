import { NextRequest, NextResponse } from 'next/server'
import { STRAPI_SERVER_URL, readJsonResponse } from '@/lib/strapi-server'

const STRAPI = STRAPI_SERVER_URL
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

// Vérifie le JWT Strapi et retourne l'utilisateur, ou null si invalide
async function verifyJwt(jwt: string): Promise<{ email: string } | null> {
  try {
    const res = await fetch(`${STRAPI}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const user = await readJsonResponse<{ email?: string }>(res, 'Strapi users/me')
    return user?.email ? { email: user.email } : null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  // Lire le JWT depuis le cookie httpOnly (non accessible JS)
  const jwt = req.cookies.get('ndombi_jwt')?.value
  if (!jwt) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Vérifier le JWT côté Strapi — dériver l'email du token vérifié, pas du query param
  const user = await verifyJwt(jwt)
  if (!user) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })

  const params = new URLSearchParams({
    'filters[email_client][$eq]':               user.email,
    'sort':                                      'createdAt:desc',
    'pagination[pageSize]':                      '20',
    'populate[appartement][fields][0]':          'titre',
    'populate[appartement][fields][1]':          'slug',
    'populate[appartement][fields][2]':          'quartier',
    'populate[appartement][populate][image_principale][fields][0]': 'url',
  })

  const res = await fetch(`${STRAPI}/api/reservations?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.json({ data: [] })
  const data = await readJsonResponse<{ data?: unknown[] }>(res, 'Strapi mes reservations')
  return NextResponse.json({ data: data.data ?? [] })
}

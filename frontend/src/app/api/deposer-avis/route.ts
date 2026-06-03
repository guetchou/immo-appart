import { NextRequest, NextResponse } from 'next/server'
import { STRAPI_SERVER_URL, readJsonResponse } from '@/lib/strapi-server'

const STRAPI = STRAPI_SERVER_URL
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

// Vérifie le JWT Strapi et retourne l'utilisateur, ou null
async function verifyJwt(jwt: string): Promise<{ email: string; username?: string } | null> {
  try {
    const res = await fetch(`${STRAPI}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const user = await readJsonResponse<{ email?: string; username?: string }>(res, 'Strapi users/me')
    return user?.email ? { email: user.email, username: user.username } : null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })

  const {
    appartement_id, prenom_auteur: prenomBody, note_globale, commentaire, origine,
    note_proprete, note_communication, note_emplacement, note_rapport_qualite_prix,
  } = body as Record<string, unknown>

  if (!appartement_id || !note_globale || !commentaire)
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 422 })

  if (String(commentaire).length < 20)
    return NextResponse.json({ error: 'Commentaire trop court (20 caractères minimum).' }, { status: 422 })

  // Si connecté → prenom issu du token vérifié (non spoofable)
  // Si anonyme → prenom fourni par le client (avis soumis à modération admin de toute façon)
  let prenomFinal = String(prenomBody ?? '').trim().slice(0, 50)
  const jwt = req.cookies.get('ndombi_jwt')?.value
  if (jwt) {
    const caller = await verifyJwt(jwt)
    if (caller) {
      // Extraire prénom du username ou email — ne fait pas confiance au body
      prenomFinal = (caller.username?.split(' ')[0] ?? caller.email.split('@')[0]).slice(0, 50)
    }
  }

  if (!prenomFinal)
    return NextResponse.json({ error: 'Veuillez indiquer votre prénom.' }, { status: 422 })

  const payload = {
    data: {
      prenom_auteur:             prenomFinal,
      note_globale:              Number(note_globale),
      commentaire:               String(commentaire).slice(0, 1000),
      origine:                   origine ? String(origine).slice(0, 80) : null,
      note_proprete:             note_proprete    ? Number(note_proprete)    : null,
      note_communication:        note_communication ? Number(note_communication) : null,
      note_emplacement:          note_emplacement   ? Number(note_emplacement)   : null,
      note_rapport_qualite_prix: note_rapport_qualite_prix ? Number(note_rapport_qualite_prix) : null,
      verifie:                   false,
      en_vedette:                false,
      appartement:               appartement_id,
    },
  }

  const res = await fetch(`${STRAPI}/api/avis`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body:    JSON.stringify(payload),
  })
  const data = await readJsonResponse<{ data?: { documentId?: string }; error?: { message?: string } }>(
    res,
    'Strapi create avis'
  )

  if (!res.ok)
    return NextResponse.json({ error: data?.error?.message ?? 'Erreur Strapi' }, { status: res.status })

  return NextResponse.json({ documentId: data.data?.documentId })
}

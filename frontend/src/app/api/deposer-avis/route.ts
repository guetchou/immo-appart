import { NextRequest, NextResponse } from 'next/server'

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })

  const {
    appartement_id, prenom_auteur, note_globale, commentaire, origine,
    note_proprete, note_communication, note_emplacement, note_rapport_qualite_prix,
  } = body as Record<string, unknown>

  if (!appartement_id || !prenom_auteur || !note_globale || !commentaire)
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 422 })

  if (String(commentaire).length < 20)
    return NextResponse.json({ error: 'Commentaire trop court (20 caractères minimum).' }, { status: 422 })

  const payload = {
    data: {
      prenom_auteur,
      note_globale:              Number(note_globale),
      commentaire,
      origine:                   origine || null,
      note_proprete:             note_proprete  ? Number(note_proprete)  : null,
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
  const data = await res.json()

  if (!res.ok)
    return NextResponse.json({ error: data?.error?.message ?? 'Erreur Strapi' }, { status: res.status })

  return NextResponse.json({ documentId: data.data?.documentId })
}

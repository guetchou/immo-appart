import { NextRequest, NextResponse } from 'next/server'

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

function genRef(): string {
  const year = new Date().getFullYear()
  const num  = String(Math.floor(Math.random() * 90000) + 10000)
  return `RES-${year}-${num}`
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const { appartement_id, arrivee, depart, nb_nuits, nb_personnes,
          prenom, nom, email, telephone, whatsapp, type_client,
          societe, mode_paiement, demandes, prix_total } = body as Record<string, string|number>

  if (!appartement_id || !arrivee || !depart || !prenom || !nom || !email || !telephone || !mode_paiement) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 422 })
  }

  // Double-check disponibilité avant de créer
  const dispParams = new URLSearchParams({
    'filters[appartement][documentId][$eq]': String(appartement_id),
    'filters[statut][$ne]':                 'annulee',
    'filters[$and][0][date_arrivee][$lt]':  String(depart),
    'filters[$and][0][date_depart][$gt]':   String(arrivee),
    'pagination[pageSize]':                 '1',
  })
  const dispRes = await fetch(`${STRAPI}/api/reservations?${dispParams}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })
  const dispData = await dispRes.json()
  if ((dispData.data ?? []).length > 0) {
    return NextResponse.json({ error: 'Appartement non disponible pour ces dates.' }, { status: 409 })
  }

  // Créer la réservation
  const reference = genRef()
  const payload = {
    data: {
      reference,
      statut:           'en_attente',
      date_arrivee:     arrivee,
      date_depart:      depart,
      nombre_nuits:     Number(nb_nuits),
      nombre_personnes: Number(nb_personnes) || 1,
      prix_total:       Number(prix_total),
      mode_paiement,
      prenom_client:    prenom,
      nom_client:       nom,
      email_client:     email,
      telephone_client: telephone,
      whatsapp_client:  whatsapp || telephone,
      type_client:      type_client || 'particulier',
      nom_societe:      societe || null,
      demandes_speciales: demandes || null,
      appartement:      appartement_id,
    },
  }

  const res = await fetch(`${STRAPI}/api/reservations`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body:    JSON.stringify(payload),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error?.message ?? 'Erreur création réservation' },
      { status: res.status }
    )
  }

  // Lien WhatsApp pré-rempli pour notification immédiate
  const tel = '+242064359090'
  const msg = encodeURIComponent(
    `Nouvelle réservation ${reference}\n` +
    `Client : ${prenom} ${nom} | ${telephone}\n` +
    `Appartement ID : ${appartement_id}\n` +
    `Arrivée : ${arrivee} | Départ : ${depart} | ${nb_nuits} nuit(s)\n` +
    `Total : ${Number(prix_total).toLocaleString('fr-FR')} XAF\n` +
    `Paiement : ${mode_paiement}`
  )
  const whatsappUrl = `https://wa.me/${tel.replace(/\D/g,'')}?text=${msg}`

  return NextResponse.json({
    reference,
    documentId:  data.data?.documentId,
    whatsappUrl,
  })
}

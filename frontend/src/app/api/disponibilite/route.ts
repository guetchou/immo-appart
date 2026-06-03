import { NextRequest, NextResponse } from 'next/server'
import { STRAPI_SERVER_URL, readJsonResponse } from '@/lib/strapi-server'

const STRAPI = STRAPI_SERVER_URL
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const aptId   = searchParams.get('appartement')
  const arrivee = searchParams.get('arrivee')
  const depart  = searchParams.get('depart')

  if (!aptId || !arrivee || !depart) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Vérifie si des réservations non-annulées se chevauchent avec les dates demandées
  const params = new URLSearchParams({
    'filters[appartement][documentId][$eq]': aptId,
    'filters[statut][$ne]':                 'annulee',
    'filters[$and][0][date_arrivee][$lt]':  depart,
    'filters[$and][0][date_depart][$gt]':   arrivee,
    'pagination[pageSize]':                 '1',
    'fields[0]':                            'date_arrivee',
    'fields[1]':                            'date_depart',
  })

  const res = await fetch(`${STRAPI}/api/reservations?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Erreur Strapi' }, { status: 500 })
  }

  const data = await readJsonResponse<{ data?: Array<Record<string, unknown>> }>(res, 'Strapi disponibilite')
  const conflits = data.data ?? []

  return NextResponse.json({
    disponible: conflits.length === 0,
    conflits: conflits.map((c: Record<string, unknown>) => ({
      arrivee: c.date_arrivee,
      depart:  c.date_depart,
    })),
  })
}

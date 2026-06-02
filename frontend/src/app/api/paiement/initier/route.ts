import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const STRAPI    = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN     = process.env.STRAPI_API_TOKEN ?? ''
const MTN_KEY   = process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? ''
const MTN_USER  = process.env.MTN_MOMO_API_USER ?? ''
const MTN_PWD   = process.env.MTN_MOMO_API_KEY  ?? ''
const MTN_ENV   = process.env.MTN_MOMO_ENV ?? 'sandbox'
const AIRTEL_ID  = process.env.AIRTEL_CLIENT_ID ?? ''
const AIRTEL_SEC = process.env.AIRTEL_CLIENT_SECRET ?? ''
const AIRTEL_ENV = process.env.AIRTEL_ENV ?? 'sandbox'

const MTN_BASE    = MTN_ENV    === 'production' ? 'https://proxy.momoapi.mtn.com'    : 'https://sandbox.momoapi.mtn.com'
const AIRTEL_BASE = AIRTEL_ENV === 'production' ? 'https://openapi.airtel.africa'    : 'https://openapiuat.airtel.africa'

// Vérifie le JWT et retourne l'email de l'utilisateur authentifié
async function verifyJwt(jwt: string): Promise<{ email: string } | null> {
  try {
    const res = await fetch(`${STRAPI}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const user = await res.json()
    return user?.email ? { email: user.email } : null
  } catch { return null }
}

async function getMtnToken(): Promise<string> {
  const auth = Buffer.from(`${MTN_USER}:${MTN_PWD}`).toString('base64')
  const res = await fetch(`${MTN_BASE}/collection/token/`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Ocp-Apim-Subscription-Key': MTN_KEY },
  })
  if (!res.ok) throw new Error('MTN token failed')
  const { access_token } = await res.json()
  return access_token
}

async function getAirtelToken(): Promise<string> {
  const res = await fetch(`${AIRTEL_BASE}/auth/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: AIRTEL_ID, client_secret: AIRTEL_SEC, grant_type: 'client_credentials' }),
  })
  if (!res.ok) throw new Error('Airtel token failed')
  const { access_token } = await res.json()
  return access_token
}

export async function POST(req: NextRequest) {
  // Auth obligatoire
  const jwt = req.cookies.get('ndombi_jwt')?.value
  if (!jwt) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const caller = await verifyJwt(jwt)
  if (!caller) return NextResponse.json({ error: 'Session expirée' }, { status: 401 })

  const { operateur, telephone, reservation_documentId } = await req.json()
  if (!operateur || !telephone || !reservation_documentId)
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  // Lookup autoritatif depuis Strapi — montant et référence non contrôlés par le client
  const resaRes = await fetch(
    `${STRAPI}/api/reservations/${reservation_documentId}?fields[0]=reference&fields[1]=prix_total&fields[2]=email_client`,
    { headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store' }
  )
  if (!resaRes.ok) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
  const resaData = await resaRes.json()
  const resa = resaData.data

  // Vérification fail-closed : email absent ou non concordant → refus
  if (!resa?.email_client || resa.email_client !== caller.email)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const montantAutorise = Number(resa?.prix_total ?? 0)
  const referenceAuth   = String(resa?.reference ?? reservation_documentId)

  if (montantAutorise <= 0)
    return NextResponse.json({ error: 'Montant invalide' }, { status: 422 })

  const hasCredentials = operateur === 'mtn_momo'
    ? !!(MTN_KEY && MTN_USER && MTN_PWD)
    : !!(AIRTEL_ID && AIRTEL_SEC)

  // Mode démo sans credentials
  if (!hasCredentials) {
    return NextResponse.json({
      transactionId: `DEMO-${randomUUID()}`,
      statut:  'en_cours',
      montant: montantAutorise,
      message: 'Mode démonstration — configurez MTN_MOMO_* ou AIRTEL_* pour activer le paiement réel.',
    })
  }

  try {
    const transactionId = randomUUID()

    if (operateur === 'mtn_momo') {
      const token = await getMtnToken()
      const tel   = telephone.replace(/\D/g, '').replace(/^0/, '242')
      const res   = await fetch(`${MTN_BASE}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization':             `Bearer ${token}`,
          'X-Reference-Id':            transactionId,
          'X-Target-Environment':      MTN_ENV,
          'Ocp-Apim-Subscription-Key': MTN_KEY,
          'Content-Type':              'application/json',
        },
        body: JSON.stringify({
          amount:       String(montantAutorise),
          currency:     'XAF',
          externalId:   referenceAuth,
          payer:        { partyIdType: 'MSISDN', partyId: tel },
          payerMessage: `Réservation ${referenceAuth} — Résidence NDOMBI`,
          payeeNote:    `Réservation ${referenceAuth}`,
        }),
      })
      if (!res.ok && res.status !== 202)
        return NextResponse.json({ error: 'Échec demande MTN MoMo' }, { status: 502 })
      return NextResponse.json({ transactionId, statut: 'en_cours', montant: montantAutorise })
    }

    if (operateur === 'airtel_money') {
      const token = await getAirtelToken()
      const tel   = telephone.replace(/\D/g, '').replace(/^0/, '')
      const res   = await fetch(`${AIRTEL_BASE}/merchant/v1/payments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
          'X-Country':     'CG',
          'X-Currency':    'XAF',
        },
        body: JSON.stringify({
          reference: referenceAuth,
          subscriber: { country: 'CG', currency: 'XAF', msisdn: tel },
          transaction: { amount: String(montantAutorise), country: 'CG', currency: 'XAF', id: transactionId },
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok)
        return NextResponse.json({ error: body?.status?.message ?? 'Échec Airtel Money' }, { status: 502 })
      return NextResponse.json({ transactionId: body?.data?.transaction?.id ?? transactionId, statut: 'en_cours', montant: montantAutorise })
    }

    return NextResponse.json({ error: 'Opérateur non supporté' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Initie un paiement Mobile Money (MTN MoMo ou Airtel Money).
 * Variables d'environnement requises selon l'opérateur :
 *
 * MTN MoMo (Collection API) :
 *   MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_API_USER, MTN_MOMO_API_KEY, MTN_MOMO_ENV (sandbox|production)
 *
 * Airtel Money (Africa API) :
 *   AIRTEL_CLIENT_ID, AIRTEL_CLIENT_SECRET, AIRTEL_ENV (sandbox|production)
 */

const MTN_KEY   = process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? ''
const MTN_USER  = process.env.MTN_MOMO_API_USER ?? ''
const MTN_PWD   = process.env.MTN_MOMO_API_KEY  ?? ''
const MTN_ENV   = process.env.MTN_MOMO_ENV ?? 'sandbox'

const AIRTEL_ID  = process.env.AIRTEL_CLIENT_ID ?? ''
const AIRTEL_SEC = process.env.AIRTEL_CLIENT_SECRET ?? ''
const AIRTEL_ENV = process.env.AIRTEL_ENV ?? 'sandbox'

const MTN_BASE    = MTN_ENV === 'production'
  ? 'https://proxy.momoapi.mtn.com'
  : 'https://sandbox.momoapi.mtn.com'

const AIRTEL_BASE = AIRTEL_ENV === 'production'
  ? 'https://openapi.airtel.africa'
  : 'https://openapiuat.airtel.africa'

async function getMtnToken(): Promise<string> {
  const auth = Buffer.from(`${MTN_USER}:${MTN_PWD}`).toString('base64')
  const res = await fetch(`${MTN_BASE}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization':             `Basic ${auth}`,
      'Ocp-Apim-Subscription-Key': MTN_KEY,
    },
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
  const { operateur, telephone, montant, reference, devise = 'XAF' } = await req.json()

  if (!operateur || !telephone || !montant || !reference)
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  // Sans credentials → mode démo (développement)
  const hasCredentials = operateur === 'mtn_momo'
    ? !!(MTN_KEY && MTN_USER && MTN_PWD)
    : !!(AIRTEL_ID && AIRTEL_SEC)

  if (!hasCredentials) {
    // Retourner un ID fictif pour les tests
    return NextResponse.json({
      transactionId: `DEMO-${randomUUID()}`,
      statut: 'en_cours',
      message: 'Mode démonstration — intégrez MTN_MOMO_* ou AIRTEL_* dans .env pour activer le paiement réel.',
    })
  }

  try {
    const transactionId = randomUUID()

    if (operateur === 'mtn_momo') {
      const token = await getMtnToken()
      const tel = telephone.replace(/\D/g, '').replace(/^0/, '242') // format E.164 Congo
      const res = await fetch(`${MTN_BASE}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization':             `Bearer ${token}`,
          'X-Reference-Id':            transactionId,
          'X-Target-Environment':      MTN_ENV,
          'Ocp-Apim-Subscription-Key': MTN_KEY,
          'Content-Type':              'application/json',
        },
        body: JSON.stringify({
          amount:         String(montant),
          currency:       devise,
          externalId:     reference,
          payer:          { partyIdType: 'MSISDN', partyId: tel },
          payerMessage:   `Réservation ${reference} — Résidence NDOMBI`,
          payeeNote:      `Réservation ${reference}`,
        }),
      })
      if (!res.ok && res.status !== 202)
        return NextResponse.json({ error: 'Échec demande MTN MoMo' }, { status: 502 })

      return NextResponse.json({ transactionId, statut: 'en_cours' })
    }

    if (operateur === 'airtel_money') {
      const token = await getAirtelToken()
      const tel = telephone.replace(/\D/g, '').replace(/^0/, '')
      const res = await fetch(`${AIRTEL_BASE}/merchant/v1/payments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type':  'application/json',
          'X-Country':     'CG',
          'X-Currency':    devise,
        },
        body: JSON.stringify({
          reference,
          subscriber: { country: 'CG', currency: devise, msisdn: tel },
          transaction: { amount: String(montant), country: 'CG', currency: devise, id: transactionId },
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok)
        return NextResponse.json({ error: body?.status?.message ?? 'Échec Airtel Money' }, { status: 502 })

      return NextResponse.json({ transactionId: body?.data?.transaction?.id ?? transactionId, statut: 'en_cours' })
    }

    return NextResponse.json({ error: 'Opérateur non supporté' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? 'Erreur paiement' }, { status: 500 })
  }
}

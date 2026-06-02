import { NextRequest, NextResponse } from 'next/server'

const MTN_KEY  = process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? ''
const MTN_USER = process.env.MTN_MOMO_API_USER ?? ''
const MTN_PWD  = process.env.MTN_MOMO_API_KEY  ?? ''
const MTN_ENV  = process.env.MTN_MOMO_ENV ?? 'sandbox'
const MTN_BASE = MTN_ENV === 'production' ? 'https://proxy.momoapi.mtn.com' : 'https://sandbox.momoapi.mtn.com'

const AIRTEL_ID  = process.env.AIRTEL_CLIENT_ID ?? ''
const AIRTEL_SEC = process.env.AIRTEL_CLIENT_SECRET ?? ''
const AIRTEL_ENV = process.env.AIRTEL_ENV ?? 'sandbox'
const AIRTEL_BASE = AIRTEL_ENV === 'production' ? 'https://openapi.airtel.africa' : 'https://openapiuat.airtel.africa'

const MTN_STATUT: Record<string, string> = {
  SUCCESSFUL: 'reussi', PENDING: 'en_cours', FAILED: 'echoue',
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const operateur     = searchParams.get('operateur')
  const transactionId = searchParams.get('transactionId')

  if (!operateur || !transactionId)
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  // Mode démo
  if (transactionId.startsWith('DEMO-'))
    return NextResponse.json({ statut: 'en_cours', demo: true })

  try {
    if (operateur === 'mtn_momo') {
      const auth  = Buffer.from(`${MTN_USER}:${MTN_PWD}`).toString('base64')
      const tokRes = await fetch(`${MTN_BASE}/collection/token/`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${auth}`, 'Ocp-Apim-Subscription-Key': MTN_KEY },
      })
      const { access_token } = await tokRes.json()

      const res = await fetch(`${MTN_BASE}/collection/v1_0/requesttopay/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${access_token}`, 'Ocp-Apim-Subscription-Key': MTN_KEY, 'X-Target-Environment': MTN_ENV },
      })
      const body = await res.json()
      return NextResponse.json({ statut: MTN_STATUT[body.status] ?? 'inconnu', raw: body.status })
    }

    if (operateur === 'airtel_money') {
      const tokRes = await fetch(`${AIRTEL_BASE}/auth/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: AIRTEL_ID, client_secret: AIRTEL_SEC, grant_type: 'client_credentials' }),
      })
      const { access_token } = await tokRes.json()

      const res = await fetch(`${AIRTEL_BASE}/standard/v1/payments/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${access_token}`, 'X-Country': 'CG', 'X-Currency': 'XAF' },
      })
      const body = await res.json()
      const code  = body?.data?.transaction?.status ?? 'TS'
      const statut = code === 'TS' ? 'reussi' : code === 'TIP' ? 'en_cours' : 'echoue'
      return NextResponse.json({ statut, raw: code })
    }

    return NextResponse.json({ error: 'Opérateur non supporté' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

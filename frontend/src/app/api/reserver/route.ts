import { NextRequest, NextResponse } from 'next/server'

const STRAPI      = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN       = process.env.STRAPI_API_TOKEN ?? ''
const RESEND_KEY  = process.env.RESEND_API_KEY ?? ''
const FROM_EMAIL  = process.env.FROM_EMAIL ?? 'reservations@residencendombi.cg'
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'residencendombi@gmail.com'

function genRef(): string {
  return `RES-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`
}

function fmtDate(d: string) {
  return new Date(d + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) return // Pas de clé → on saute silencieusement
  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    })
  } catch { /* ne pas bloquer la réservation si l'email échoue */ }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const { appartement_id, arrivee, depart, nb_nuits, nb_personnes,
          prenom, nom, email, telephone, whatsapp, type_client,
          societe, mode_paiement, demandes, prix_total,
          appartement_titre } = body as Record<string, string|number>

  if (!appartement_id || !arrivee || !depart || !prenom || !nom || !email || !telephone || !mode_paiement)
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 422 })

  // Double-check disponibilité
  const dispParams = new URLSearchParams({
    'filters[appartement][documentId][$eq]': String(appartement_id),
    'filters[statut][$ne]':                 'annulee',
    'filters[$and][0][date_arrivee][$lt]':  String(depart),
    'filters[$and][0][date_depart][$gt]':   String(arrivee),
    'pagination[pageSize]':                 '1',
  })
  const dispRes  = await fetch(`${STRAPI}/api/reservations?${dispParams}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }, cache: 'no-store',
  })
  const dispData = await dispRes.json()
  if ((dispData.data ?? []).length > 0)
    return NextResponse.json({ error: 'Appartement non disponible pour ces dates.' }, { status: 409 })

  // Créer la réservation
  const reference = genRef()
  const res = await fetch(`${STRAPI}/api/reservations`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ data: {
      reference, statut: 'en_attente',
      date_arrivee: arrivee, date_depart: depart,
      nombre_nuits: Number(nb_nuits), nombre_personnes: Number(nb_personnes) || 1,
      prix_total: Number(prix_total), mode_paiement,
      prenom_client: prenom, nom_client: nom,
      email_client: email, telephone_client: telephone,
      whatsapp_client: whatsapp || telephone,
      type_client: type_client || 'particulier',
      nom_societe: societe || null,
      demandes_speciales: demandes || null,
      appartement: appartement_id,
    }}),
  })
  const data = await res.json()

  if (!res.ok)
    return NextResponse.json({ error: data?.error?.message ?? 'Erreur création réservation' }, { status: res.status })

  const aptNom     = String(appartement_titre || `Appartement #${appartement_id}`)
  const totalFormate = Number(prix_total).toLocaleString('fr-FR')
  const arrFormate  = fmtDate(String(arrivee))
  const depFormate  = fmtDate(String(depart))

  // ── Email client ─────────────────────────────────
  await sendEmail(
    String(email),
    `Réservation reçue — ${reference}`,
    `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5DDD4">
      <div style="background:#1A0E06;padding:24px 28px">
        <div style="font-size:20px;font-weight:900;color:#fff">Résidence NDOMBI</div>
        <div style="font-size:12px;color:#F09A55;margin-top:2px">Votre réservation a bien été reçue</div>
      </div>
      <div style="padding:28px">
        <h2 style="font-size:18px;margin:0 0 16px;color:#1A0E06">Bonjour ${prenom},</h2>
        <p style="color:#7A6550;margin-bottom:20px">Votre demande de réservation a été enregistrée. Notre équipe vous contactera sous <strong>30 minutes</strong> pour confirmer.</p>
        <div style="background:#FBF8F4;border-radius:10px;padding:16px;margin-bottom:20px;border:1px solid #E5DDD4">
          <div style="font-size:13px;color:#7A6550;margin-bottom:4px">Référence</div>
          <div style="font-size:18px;font-weight:900;color:#E07A2F;letter-spacing:0.5px">${reference}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${[
            ['Appartement', aptNom],
            ['Arrivée',     arrFormate],
            ['Départ',      depFormate],
            ['Durée',       `${nb_nuits} nuit${Number(nb_nuits)>1?'s':''}`],
            ['Total',       `${totalFormate} XAF`],
            ['Paiement',    String(mode_paiement).replace('_',' ')],
          ].map(([k,v]) => `
          <tr style="border-bottom:1px solid #E5DDD4">
            <td style="padding:8px 0;color:#7A6550">${k}</td>
            <td style="padding:8px 0;font-weight:600;text-align:right;color:#1A0E06">${v}</td>
          </tr>`).join('')}
        </table>
        <div style="margin-top:20px;padding:16px;background:#DBEAFE;border-radius:8px;font-size:13px;color:#0369A1">
          Notre équipe vous contactera par WhatsApp au numéro ${telephone} pour finaliser votre réservation.
        </div>
      </div>
      <div style="background:#F3EFE9;padding:16px 28px;font-size:12px;color:#7A6550;text-align:center">
        Résidence NDOMBI · Foucks, Pointe-Noire, République du Congo · +242 06 435 90 90
      </div>
    </div>
    `
  )

  // ── Email propriétaire ────────────────────────────
  await sendEmail(
    OWNER_EMAIL,
    `[NOUVELLE RÉSERVATION] ${reference} — ${prenom} ${nom}`,
    `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #E5DDD4">
      <div style="background:#E07A2F;padding:20px 28px">
        <div style="font-size:18px;font-weight:900;color:#fff">Nouvelle réservation</div>
        <div style="font-size:13px;color:rgba(255,255,255,.8)">${reference}</div>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          ${[
            ['Client',      `${prenom} ${nom}`],
            ['Email',       String(email)],
            ['Téléphone',   String(telephone)],
            ['Appartement', aptNom],
            ['Arrivée',     arrFormate],
            ['Départ',      depFormate],
            ['Durée',       `${nb_nuits} nuit${Number(nb_nuits)>1?'s':''}`],
            ['Total',       `${totalFormate} XAF`],
            ['Paiement',    String(mode_paiement).replace('_',' ')],
            ['Demandes',    String(demandes||'Aucune')],
          ].map(([k,v]) => `
          <tr style="border-bottom:1px solid #F3EDE7">
            <td style="padding:8px 0;color:#7A6550;width:130px">${k}</td>
            <td style="padding:8px 0;font-weight:600;color:#1A0E06">${v}</td>
          </tr>`).join('')}
        </table>
        <div style="margin-top:16px">
          <a href="https://wa.me/${String(telephone).replace(/\D/g,'')}" style="display:inline-block;padding:12px 20px;background:#16A34A;color:#fff;border-radius:8px;font-weight:700;text-decoration:none;font-size:13px">
            Contacter le client sur WhatsApp
          </a>
        </div>
      </div>
    </div>
    `
  )

  // Lien WhatsApp pré-rempli
  const msg = encodeURIComponent(
    `Nouvelle réservation ${reference}\nClient : ${prenom} ${nom} | ${telephone}\n` +
    `${aptNom} · Arrivée : ${arrivee} | Départ : ${depart} | ${nb_nuits} nuit(s)\n` +
    `Total : ${totalFormate} XAF | Paiement : ${mode_paiement}`
  )
  const whatsappUrl = `https://wa.me/242064359090?text=${msg}`

  return NextResponse.json({ reference, documentId: data.data?.documentId, whatsappUrl })
}

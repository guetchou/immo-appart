import SiteNavbar from '@/components/layout/SiteNavbar'
import SiteFooter from '@/components/layout/SiteFooter'
import { Metadata } from 'next'
import { getPagePaiement } from '@/lib/strapi'

export const metadata: Metadata = { title: 'Modes de paiement — Résidence NDOMBI' }

const MODES = [
  { name: 'Airtel Money', desc: 'Envoi instantané depuis votre téléphone Airtel Congo. Numéro : +242 06 435 90 90', color: '#E07A2F', bg: '#FEF0E6' },
  { name: 'MTN MoMo',     desc: 'Mobile Money MTN Congo. Envoi instantané, confirmation immédiate.',               color: '#CA8A04', bg: '#FEF9E6' },
  { name: 'Espèces',      desc: 'Paiement à l\'arrivée ou en acompte sur rendez-vous. Reçu fourni.',              color: '#16A34A', bg: '#DCFCE7' },
  { name: 'Virement bancaire', desc: 'Virement sur le compte de la Résidence NDOMBI. RIB communiqué sur demande.', color: '#0369A1', bg: '#DBEAFE' },
  { name: 'Chèque',       desc: 'Chèque à l\'ordre de Résidence NDOMBI. Remis 7 jours avant l\'arrivée.',        color: '#7C3AED', bg: '#F3E8FF' },
]

export default async function PaiementPage() {
  const page = await getPagePaiement()
  const modes = (page?.modes as typeof MODES | null) ?? MODES
  const conditions = (page?.conditions as { label: string; texte: string }[] | null) ?? [
    { label: 'Acompte', texte: '30% du montant total à la confirmation de réservation.' },
    { label: 'Solde', texte: 'Le reste est réglé à l’arrivée avant la remise des clés.' },
    { label: 'Caution', texte: 'Dépôt de garantie versé à l’arrivée, restitué dans les 48h après le départ.' },
    { label: 'Reçu', texte: 'Un reçu numérique est envoyé par WhatsApp après chaque paiement.' },
  ]

  return (
    <>
      <SiteNavbar />
      <main className="pt-[68px]" style={{ background: '#FBF8F4' }}>
        <div className="py-14 px-8 border-b border-[#E5DDD4]">
          <div className="max-w-[820px] mx-auto">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#7A6550] mb-2">{(page?.label as string) ?? 'Facturation'}</div>
            <h1 className="font-black text-[#1A0E06] mb-2" style={{ fontSize: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-heading)' }}>
              {(page?.titre as string) ?? 'Modes de paiement'}
            </h1>
            <p className="text-[#7A6550]">{(page?.introduction as string) ?? 'Nous acceptons tous les moyens de paiement adaptés au Congo Brazzaville.'}</p>
          </div>
        </div>
        <div className="max-w-[820px] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {modes.map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-5" style={{ border: '1px solid #E5DDD4' }}>
                <span className="inline-block px-3 py-1 rounded-full text-[12px] font-bold mb-3"
                  style={{ background: m.bg, color: m.color }}>{m.name}</span>
                <p className="text-[14px] text-[#7A6550]">{m.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E5DDD4' }}>
            <h2 className="font-black text-[#1A0E06] text-[18px] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>{(page?.conditions_titre as string) ?? 'Conditions de paiement'}</h2>
            <div className="space-y-3 text-[14px] text-[#7A6550]">
              {conditions.map(c => (
                <p key={c.label}><strong className="text-[#1A0E06]">{c.label} :</strong> {c.texte}</p>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

import SiteNavbar from '@/components/layout/SiteNavbar'
import Footer from '@/components/layout/Footer'
import { Metadata } from 'next'

export const metadata: Metadata = { title: "Politique d'annulation — Résidence NDOMBI" }

const POLICIES = [
  {
    type: 'Flexible',
    color: '#16A34A', bg: '#DCFCE7', border: '#86EFAC',
    desc: 'Annulation gratuite jusqu\'à 24h avant l\'arrivée. Remboursement intégral (hors frais de service).',
    detail: 'Idéal pour les voyages incertains. Aucune pénalité si vous annulez plus de 24h avant.',
  },
  {
    type: 'Modérée',
    color: '#E07A2F', bg: '#FEF0E6', border: '#FDDCBC',
    desc: 'Annulation gratuite jusqu\'à 5 jours avant l\'arrivée. Au-delà, 1 nuit facturée.',
    detail: 'Recommandée pour les séjours planifiés. Vous gardez une flexibilité raisonnable.',
  },
  {
    type: 'Stricte',
    color: '#0369A1', bg: '#DBEAFE', border: '#93C5FD',
    desc: 'Remboursement à 50% jusqu\'à 7 jours avant l\'arrivée. Aucun remboursement après.',
    detail: 'Applicable aux appartements premium et séjours longue durée avec tarif réduit.',
  },
  {
    type: 'Non remboursable',
    color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5',
    desc: 'Aucun remboursement quelle que soit la date d\'annulation.',
    detail: 'Correspond aux tarifs les plus avantageux. Souscrire une assurance voyage est conseillé.',
  },
]

export default function AnnulationPage() {
  return (
    <>
      <SiteNavbar />
      <main className="pt-[68px]" style={{ background: '#FBF8F4' }}>
        <div className="py-14 px-8 border-b border-[#E5DDD4]">
          <div className="max-w-[820px] mx-auto">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#7A6550] mb-2">Réservation</div>
            <h1 className="font-black text-[#1A0E06] mb-2" style={{ fontSize: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-heading)' }}>
              Politique d&apos;annulation
            </h1>
            <p className="text-[#7A6550]">La politique applicable est indiquée sur chaque fiche appartement.</p>
          </div>
        </div>

        <div className="max-w-[820px] mx-auto px-8 py-12 space-y-5">
          {POLICIES.map(p => (
            <div key={p.type} className="bg-white rounded-2xl p-6" style={{ border: `1.5px solid ${p.border}` }}>
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-bold mb-3"
                style={{ background: p.bg, color: p.color }}>{p.type}</span>
              <p className="font-bold text-[15px] text-[#1A0E06] mb-1">{p.desc}</p>
              <p className="text-[14px] text-[#7A6550]">{p.detail}</p>
            </div>
          ))}

          <div className="bg-white rounded-2xl p-6 mt-8" style={{ border: '1px solid #E5DDD4' }}>
            <h2 className="font-black text-[#1A0E06] text-[18px] mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Procédure d&apos;annulation</h2>
            <ol className="space-y-2 text-[14px] text-[#7A6550] list-decimal list-inside">
              <li>Contactez-nous par WhatsApp au <strong className="text-[#1A0E06]">+242 06 435 90 90</strong></li>
              <li>Communiquez votre référence de réservation (RES-AAAA-XXXXX)</li>
              <li>Confirmation de l&apos;annulation envoyée dans les 2 heures</li>
              <li>Remboursement traité dans les 5 à 10 jours ouvrables selon le mode de paiement</li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

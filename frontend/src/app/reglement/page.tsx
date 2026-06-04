import SiteNavbar from '@/components/layout/SiteNavbar'
import SiteFooter from '@/components/layout/SiteFooter'
import { Metadata } from 'next'
import { getPageReglement } from '@/lib/strapi'

export const metadata: Metadata = { title: 'Règlement intérieur — Résidence NDOMBI' }

const RULES = [
  { title: 'Horaires', items: ['Check-in : à partir de 14h00', 'Check-out : avant 11h00', 'Arrivée tardive (après 21h) : prévenir 24h à l\'avance'] },
  { title: 'Occupants', items: ['Seuls les voyageurs déclarés lors de la réservation sont autorisés', 'Toute personne supplémentaire doit être signalée', 'Interdiction de sous-louer ou céder le logement'] },
  { title: 'Bruit & voisinage', items: ['Silence de 22h à 7h', 'Musique à volume modéré uniquement', 'Fêtes et rassemblements interdits sans accord préalable'] },
  { title: 'Tabac & animaux', items: ['Logements strictement non-fumeurs (y compris les balcons)', 'Animaux de compagnie non acceptés (sauf accord écrit)'] },
  { title: 'Entretien', items: ['Laisser l\'appartement dans l\'état d\'origine', 'Signaler immédiatement tout dommage ou dysfonctionnement', 'La vaisselle doit être lavée avant le départ', 'Les poubelles doivent être sorties'] },
  { title: 'Sécurité', items: ['Ne pas remettre les clés à des tiers', 'Fermer à clé en quittant l\'appartement', 'Signaler toute personne suspecte à la réception'] },
]

export default async function ReglementPage() {
  const page = await getPageReglement()
  const sections = (page?.sections as typeof RULES | null) ?? RULES

  return (
    <>
      <SiteNavbar />
      <main className="pt-[68px]" style={{ background: '#FBF8F4' }}>
        <div className="py-14 px-8 border-b border-[#E5DDD4]">
          <div className="max-w-[820px] mx-auto">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#7A6550] mb-2">{(page?.label as string) ?? 'Votre séjour'}</div>
            <h1 className="font-black text-[#1A0E06] mb-2" style={{ fontSize: 'clamp(28px,4vw,40px)', fontFamily: 'var(--font-heading)' }}>
              {(page?.titre as string) ?? 'Règlement intérieur'}
            </h1>
            <p className="text-[#7A6550]">{(page?.introduction as string) ?? 'Ces règles garantissent un séjour agréable pour tous les résidents.'}</p>
          </div>
        </div>
        <div className="max-w-[820px] mx-auto px-8 py-12 space-y-6">
          {sections.map(section => (
            <div key={section.title} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #E5DDD4' }}>
              <h2 className="font-black text-[#1A0E06] text-[16px] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#7A6550]">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: '#E07A2F' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[13px] text-[#7A6550] text-center pt-4">
            {(page?.note as string) ?? 'Tout manquement grave peut entraîner l’interruption du séjour sans remboursement.'}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

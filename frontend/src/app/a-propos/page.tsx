import SiteNavbar from '@/components/layout/SiteNavbar'
import Footer from '@/components/layout/Footer'
import { MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'À propos — Résidence NDOMBI' }

export default function AProposPage() {
  return (
    <>
      <SiteNavbar />
      <main className="pt-[68px]" style={{ background: '#FBF8F4' }}>
        <div className="py-14 px-8" style={{ background: '#1A0E06' }}>
          <div className="max-w-[820px] mx-auto text-center">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#F09A55] mb-3">Notre histoire</div>
            <h1 className="font-black text-white mb-4" style={{ fontSize: 'clamp(30px,4vw,46px)', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>
              Résidence NDOMBI
            </h1>
            <p className="text-[16px] leading-relaxed" style={{ color: 'rgba(255,255,255,.65)' }}>
              Appartements meublés haut de gamme à Foucks, Pointe-Noire — République du Congo.
            </p>
          </div>
        </div>

        <div className="max-w-[820px] mx-auto px-8 py-16 space-y-12">
          <section>
            <h2 className="font-black text-[#1A0E06] text-[24px] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Notre mission</h2>
            <p className="text-[#7A6550] leading-relaxed text-[15px]">
              La Résidence NDOMBI propose des appartements meublés entièrement équipés pour des séjours professionnels ou familiaux à Pointe-Noire. Nous offrons un service personnalisé, une confirmation rapide et des prestations hôtelières sans les contraintes d&apos;un grand hôtel.
            </p>
          </section>

          <section>
            <h2 className="font-black text-[#1A0E06] text-[24px] mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Ce qui nous distingue</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Confirmation WhatsApp en moins de 30 minutes',
                'Paiement Airtel Money, MTN MoMo, espèces ou virement',
                'Services premium : navette, chef cuisinier, conciergerie',
                'Appartements entièrement meublés et équipés',
                'Sécurité 24h/24 et parking sécurisé',
                'Idéalement situé à Foucks, proche de la Clinique MOUAMBA',
              ].map(item => (
                <div key={item} className="flex items-start gap-3 p-4 bg-white rounded-xl" style={{ border: '1px solid #E5DDD4' }}>
                  <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
                  <span className="text-[14px] text-[#1C110A]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl p-8" style={{ border: '1px solid #E5DDD4' }}>
            <h2 className="font-black text-[#1A0E06] text-[24px] mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Nous contacter</h2>
            <div className="space-y-4">
              {[
                { Icon: MapPin, text: 'Foucks, non loin de la Clinique MOUAMBA, Pointe-Noire, République du Congo' },
                { Icon: Phone,  text: '+242 06 435 90 90' },
                { Icon: Mail,   text: 'residencendombi@gmail.com' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#E07A2F' }} />
                  <span className="text-[14px] text-[#1C110A]">{text}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}

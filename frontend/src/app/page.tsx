'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Search, CheckCircle2, Phone, ArrowRight } from 'lucide-react'
import Navbar    from '@/components/layout/Navbar'
import Footer    from '@/components/layout/Footer'
import ChatBot   from '@/components/layout/ChatBot'
import ApartmentCarousel from '@/components/appartement/ApartmentCarousel'
import BookingModal from '@/components/reservation/BookingModal'

// Map chargée dynamiquement (Leaflet nécessite le navigateur)
const MapSection = dynamic(() => import('@/components/appartement/MapSection'), { ssr: false })

// ── Données de démonstration (remplacées par Strapi en Step 5) ──
const DEMO_APTS = [
  { id:1, documentId:'apt1', titre:'Studio Prestige',      slug:'studio-prestige',      quartier:'Foucks',       ville:'Pointe-Noire', prix_nuit_base:75000,  devise:'XAF' as const, type_logement:'studio' as const,    nombre_chambres:1, superficie:45,  duree_min_sejour:2, note_moyenne:4.9, nombre_avis:32, en_vedette:true,  nouveau:false, statut:'disponible' as const, image_principale:{ url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop', alternativeText:'Studio Prestige' } },
  { id:2, documentId:'apt2', titre:'T2 Élégance',          slug:'t2-elegance',          quartier:'Loandjili',    ville:'Pointe-Noire', prix_nuit_base:120000, devise:'XAF' as const, type_logement:'t2' as const,        nombre_chambres:2, superficie:80,  duree_min_sejour:3, note_moyenne:4.8, nombre_avis:18, en_vedette:false, nouveau:true,  statut:'disponible' as const, image_principale:{ url:'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=300&fit=crop', alternativeText:'T2 Élégance' } },
  { id:3, documentId:'apt3', titre:'Penthouse Vue Océan',  slug:'penthouse-vue-ocean',  quartier:'Centre-ville', ville:'Pointe-Noire', prix_nuit_base:200000, devise:'XAF' as const, type_logement:'penthouse' as const, nombre_chambres:3, superficie:150, duree_min_sejour:5, note_moyenne:5.0, nombre_avis:51, en_vedette:true,  nouveau:false, statut:'disponible' as const, image_principale:{ url:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=300&fit=crop', alternativeText:'Penthouse' } },
  { id:4, documentId:'apt4', titre:'Loft Moderne Tie-Tie', slug:'loft-moderne-tie-tie', quartier:'Tie-Tie',      ville:'Pointe-Noire', prix_nuit_base:95000,  devise:'XAF' as const, type_logement:'loft' as const,      nombre_chambres:1, superficie:65,  duree_min_sejour:1, note_moyenne:4.7, nombre_avis:27, en_vedette:false, nouveau:false, statut:'disponible' as const, image_principale:{ url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop', alternativeText:'Loft' } },
  { id:5, documentId:'apt5', titre:'Villa Familiale Ngoyo',slug:'villa-ngoyo',           quartier:'Ngoyo',        ville:'Pointe-Noire', prix_nuit_base:280000, devise:'XAF' as const, type_logement:'villa' as const,     nombre_chambres:4, superficie:220, duree_min_sejour:7, note_moyenne:4.9, nombre_avis:44, en_vedette:true,  nouveau:false, statut:'disponible' as const, image_principale:{ url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop', alternativeText:'Villa' } },
]

type ModalApt = { name: string; loc: string; price: number; img: string } | null

const FILTERS = ['Tous', 'Studios', 'T2 / T3', 'Penthouse', 'Villas', 'Services']
const STATS   = [
  { val: '48',          unit: 'résidences' },
  { val: '45 000',      unit: 'XAF / nuit min' },
  { val: '★ 4.9',       unit: '/ 5 note moy.' },
  { val: '< 30 min',    unit: 'confirmation' },
]

const TESTIMONIALS = [
  { stars:5, text:'Appartement impeccable, exactement comme sur les photos. L\'équipe NDOMBI a répondu en 10 minutes sur WhatsApp.',  name:'Marc A.',        meta:'Paris · Séjour pro',     img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { stars:5, text:'Séjour de 3 semaines pour raisons professionnelles. WiFi rapide, parking sécurisé. Service chef cuisinier top !', name:'Sophie K.',      meta:'Bruxelles · Longue durée',img:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face' },
  { stars:5, text:'Cadre magnifique, vue sur l\'océan, personnel aux petits soins. Paiement MTN MoMo très pratique !',              name:'Jean-Pierre M.', meta:'Pointe-Noire · Famille',  img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
]

const SERVICES = [
  { label:'Navette',       desc:'Transfert 24h/24',   color:'#E07A2F', bg:'rgba(224,122,47,.12)', icon:'🚗' },
  { label:'Conciergerie',  desc:'Assistance perso.',  color:'#22C55E', bg:'rgba(34,197,94,.12)',  icon:'🎯' },
  { label:'Chef cuisinier',desc:'Cuisine domicile',   color:'#0EA5E9', bg:'rgba(14,165,233,.12)', icon:'🍽' },
  { label:'Sécurité 24h',  desc:'Gardiennage',        color:'#E07A2F', bg:'rgba(224,122,47,.12)', icon:'🛡' },
  { label:'Ménage',        desc:'Linge inclus',       color:'#22C55E', bg:'rgba(34,197,94,.12)',  icon:'✨' },
]

export default function HomePage() {
  const [filter, setFilter]   = useState('Tous')
  const [modal,  setModal]    = useState<ModalApt>(null)

  const openModal = (name: string, loc: string, price: number, img: string) =>
    setModal({ name, loc, price, img })

  return (
    <>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative mt-[68px] flex items-center justify-center overflow-hidden"
        style={{ height: '88vh', minHeight: '560px' }}>
        {/* Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&h=900&fit=crop&crop=center"
          alt="Résidence de luxe à Pointe-Noire"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0" style={{ background: 'rgba(15,8,2,.52)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-6 w-full max-w-[820px]">
          <h1
            className="font-black text-white mb-3 leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(36px,5.5vw,68px)', fontFamily: 'var(--font-heading)', letterSpacing: '-2px' }}
          >
            Réservez votre<br />
            résidence à <span style={{ color: '#F09A55' }}>Pointe-Noire</span>
          </h1>
          <p className="mb-8 font-light" style={{ color: 'rgba(255,255,255,.72)', fontSize: '16px' }}>
            Appartements meublés haut de gamme · Confirmation WhatsApp en 30 min
          </p>

          {/* Search bar */}
          <div
            className="flex items-center rounded-[14px] mx-auto mb-0"
            style={{ background: '#fff', border: '1px solid #E5DDD4', boxShadow: '0 20px 60px rgba(0,0,0,.3)', maxWidth: '720px' }}
          >
            <Search size={18} className="ml-4 flex-shrink-0" style={{ color: '#7A6550' }} />
            <input
              type="text"
              placeholder="Où êtes-vous situé ?"
              className="flex-1 px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] placeholder:text-[#7A6550]"
            />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <input type="date" className="px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[130px]" title="Arrivée" />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <input type="date" className="px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[130px]" title="Départ" />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <select className="px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[120px]">
              <option>1 voyageur</option>
              <option>2 voyageurs</option>
              <option>3+ voyageurs</option>
            </select>
            <button
              className="m-1.5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-colors flex-shrink-0"
              style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}
            >
              <Search size={15} />
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS + FILTER BAR ─────────────────────────── */}
      <div className="bg-white border-b border-[#E5DDD4]">
        <div className="max-w-[1240px] mx-auto px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          {/* Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="w-2 h-2 rounded-full inline-block animate-pulse-green" style={{ background: '#22C55E' }} />
              <strong style={{ fontFamily: 'var(--font-heading)' }}>48</strong>&nbsp;résidences disponibles
            </div>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]">Dès <strong style={{ color: '#1A0E06' }}>45 000 XAF</strong>/nuit</span>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]"><strong>★ 4.9</strong> / 5</span>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]">Confirmation <strong style={{ color: '#16A34A' }}>WhatsApp &lt; 30 min</strong></span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                style={{
                  fontFamily:  'var(--font-heading)',
                  background:  filter === f ? '#E07A2F' : '#fff',
                  color:       filter === f ? '#fff'    : '#1C110A',
                  border:      `1.5px solid ${filter === f ? '#E07A2F' : '#E5DDD4'}`,
                }}
                onMouseEnter={e => { if (filter !== f) { e.currentTarget.style.borderColor = '#E07A2F'; e.currentTarget.style.color = '#E07A2F' } }}
                onMouseLeave={e => { if (filter !== f) { e.currentTarget.style.borderColor = '#E5DDD4'; e.currentTarget.style.color = '#1C110A' } }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CAROUSEL ──────────────────────────────────── */}
      <section className="py-20" id="appartements">
        <div className="max-w-[1240px] mx-auto px-10 flex items-end justify-between mb-9">
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2" style={{ color: '#E07A2F' }}>
              Notre sélection
            </div>
            <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
              Appartements disponibles
            </h2>
            <div className="w-10 h-[3px] rounded-full" style={{ background: '#E07A2F' }} />
          </div>
          <a
            href="/appartements"
            className="flex items-center gap-2 text-[14px] font-bold transition-colors hover:text-[#E07A2F]"
            style={{ color: '#7A6550', fontFamily: 'var(--font-heading)' }}
          >
            Voir tout <ArrowRight size={15} />
          </a>
        </div>
        <ApartmentCarousel
          apartments={DEMO_APTS}
          onReserve={apt => openModal(apt.titre, `${apt.quartier}, ${apt.ville}`, apt.prix_nuit_base, apt.image_principale?.url ?? '')}
        />
      </section>

      {/* ── HUMAN SECTION ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '480px' }}>
        <div className="relative overflow-hidden" style={{ minHeight: '380px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=500&fit=crop&crop=top"
            alt="Personne cherchant un appartement"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-y-0 right-0 w-20" style={{ background: '#1A0E06' }} />
        </div>
        <div className="flex flex-col justify-center px-14 py-16" style={{ background: '#1A0E06' }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase mb-3" style={{ color: '#F09A55' }}>
            Recherche simplifiée
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontSize: 'clamp(26px,3vw,36px)', fontFamily: 'var(--font-heading)' }}>
            Trouvez votre résidence idéale
          </h2>
          <p className="mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,.6)', fontSize: '15px' }}>
            Notre équipe vous accompagne à chaque étape — sélection, réservation, check-in et services.
          </p>
          <ul className="space-y-3 mb-9">
            {[
              'Disponibilité en temps réel sur le calendrier',
              'Paiement Airtel Money, MTN MoMo ou espèces',
              'Confirmation WhatsApp sous 30 minutes',
              'Services premium sur mesure disponibles',
            ].map(item => (
              <li key={item} className="flex items-center gap-3 text-[14px]" style={{ color: 'rgba(255,255,255,.85)' }}>
                <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
          <a
            href="tel:+242064359090"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all self-start"
            style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)', fontSize: '14px' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
            onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}
          >
            <Phone size={16} />
            Parler à un agent
          </a>
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
      <section className="py-20" id="temoignages" style={{ background: '#FBF8F4' }}>
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2" style={{ color: '#E07A2F' }}>Avis clients vérifiés</div>
          <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize: '32px', fontFamily: 'var(--font-heading)' }}>
            Ce que disent nos résidents
          </h2>
          <div className="w-10 h-[3px] rounded-full mb-10" style={{ background: '#E07A2F' }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                className="bg-white rounded-2xl p-7 transition-all"
                style={{ border: '1px solid #E5DDD4', boxShadow: '0 2px 8px rgba(26,14,6,.07)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(26,14,6,.11)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,14,6,.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px]" style={{ color: '#E07A2F' }}>{'★'.repeat(t.stars)}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: '#16A34A' }}>
                    <CheckCircle2 size={11} /> Vérifié
                  </span>
                </div>
                <p className="text-[14px] leading-[1.75] italic mb-5" style={{ color: '#7A6550' }}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #E5DDD4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" style={{ border: '2px solid #E5DDD4' }} />
                  <div>
                    <div className="font-bold text-[14px]">{t.name}</div>
                    <div className="text-[12px]" style={{ color: '#7A6550' }}>{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <section className="py-16" id="services" style={{ background: '#1A0E06' }}>
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2" style={{ color: '#F09A55' }}>Services premium</div>
              <h2 className="font-black text-white" style={{ fontSize: '30px', fontFamily: 'var(--font-heading)' }}>Une expérience complète</h2>
            </div>
            <a href="#" className="text-[14px] font-bold transition-colors hover:text-[#E07A2F]"
              style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-heading)', border: '1px solid rgba(255,255,255,.15)', padding: '8px 16px', borderRadius: '8px' }}>
              Voir tout
            </a>
          </div>
          <div
            className="grid rounded-2xl overflow-hidden"
            style={{ gridTemplateColumns: 'repeat(5,1fr)', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.06)' }}
          >
            {SERVICES.map(s => (
              <div
                key={s.label}
                className="px-5 py-7 text-center transition-colors"
                style={{ borderRight: '1px solid rgba(255,255,255,.06)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2C1A08')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl"
                  style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div className="font-bold text-[13px] text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{s.label}</div>
                <div className="text-[12px]" style={{ color: 'rgba(255,255,255,.4)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAP ───────────────────────────────────────── */}
      <MapSection onReserve={openModal} />

      <Footer />
      <ChatBot />

      {/* ── BOOKING MODAL ─────────────────────────────── */}
      <BookingModal apt={modal} onClose={() => setModal(null)} />
    </>
  )
}

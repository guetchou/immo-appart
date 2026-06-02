'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Search, CheckCircle2, Phone, ArrowRight, Car, ConciergeBell, ChefHat, ShieldCheck, Sparkles } from 'lucide-react'
import Navbar         from '@/components/layout/Navbar'
import Footer         from '@/components/layout/Footer'
import ChatBot        from '@/components/layout/ChatBot'
import ApartmentCarousel from '@/components/appartement/ApartmentCarousel'
import BookingModal   from '@/components/reservation/BookingModal'
import SocialWall     from '@/components/social/SocialWall'

const MapSection = dynamic(() => import('@/components/appartement/MapSection'), { ssr: false })

// ── Types ────────────────────────────────────────────
type AptItem = {
  id: number; documentId: string; titre: string; slug: string; quartier: string; ville: string
  prix_nuit_base: number; devise: 'XAF' | 'USD' | 'EUR' | 'CDF'
  type_logement: 'studio'|'t1'|'t2'|'t3'|'t4'|'t5_plus'|'villa'|'penthouse'|'duplex'|'loft'
  nombre_chambres: number; superficie?: number; duree_min_sejour: number
  note_moyenne?: number; nombre_avis: number
  en_vedette: boolean; nouveau: boolean; statut: 'disponible'|'occupe'|'maintenance'|'inactif'
  image_principale?: { url: string; alternativeText: string | null }
}
type ModalApt = { name: string; loc: string; price: number; img: string } | null

// ── Données de démo (fallback Strapi vide) ───────────
const DEMO_APTS: AptItem[] = [
  { id:1, documentId:'apt1', titre:'Studio Prestige',       slug:'studio-prestige',      quartier:'Foucks',       ville:'Pointe-Noire', prix_nuit_base:75000,  devise:'XAF', type_logement:'studio',    nombre_chambres:1, superficie:45,  duree_min_sejour:2, note_moyenne:4.9, nombre_avis:32, en_vedette:true,  nouveau:false, statut:'disponible', image_principale:{url:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop',alternativeText:'Studio Prestige'} },
  { id:2, documentId:'apt2', titre:'T2 Élégance',           slug:'t2-elegance',          quartier:'Loandjili',    ville:'Pointe-Noire', prix_nuit_base:120000, devise:'XAF', type_logement:'t2',        nombre_chambres:2, superficie:80,  duree_min_sejour:3, note_moyenne:4.8, nombre_avis:18, en_vedette:false, nouveau:true,  statut:'disponible', image_principale:{url:'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&h=300&fit=crop',alternativeText:'T2 Élégance'} },
  { id:3, documentId:'apt3', titre:'Penthouse Vue Océan',   slug:'penthouse-vue-ocean',  quartier:'Centre-ville', ville:'Pointe-Noire', prix_nuit_base:200000, devise:'XAF', type_logement:'penthouse', nombre_chambres:3, superficie:150, duree_min_sejour:5, note_moyenne:5.0, nombre_avis:51, en_vedette:true,  nouveau:false, statut:'disponible', image_principale:{url:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&h=300&fit=crop',alternativeText:'Penthouse'} },
  { id:4, documentId:'apt4', titre:'Loft Moderne Tie-Tie',  slug:'loft-moderne-tie-tie', quartier:'Tie-Tie',      ville:'Pointe-Noire', prix_nuit_base:95000,  devise:'XAF', type_logement:'loft',      nombre_chambres:1, superficie:65,  duree_min_sejour:1, note_moyenne:4.7, nombre_avis:27, en_vedette:false, nouveau:false, statut:'disponible', image_principale:{url:'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&h=300&fit=crop',alternativeText:'Loft'} },
  { id:5, documentId:'apt5', titre:'Villa Familiale Ngoyo', slug:'villa-ngoyo',           quartier:'Ngoyo',        ville:'Pointe-Noire', prix_nuit_base:280000, devise:'XAF', type_logement:'villa',     nombre_chambres:4, superficie:220, duree_min_sejour:7, note_moyenne:4.9, nombre_avis:44, en_vedette:true,  nouveau:false, statut:'disponible', image_principale:{url:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=300&fit=crop',alternativeText:'Villa'} },
]

const SERVICES_DEFAULT = [
  { label:'Navette aéroport', desc:'Transfert privé 24h/24', color:'#E07A2F', bg:'#FEF0E6', Icon: Car          },
  { label:'Conciergerie',     desc:'Assistance personnalisée',color:'#16A34A', bg:'#DCFCE7', Icon: ConciergeBell },
  { label:'Chef cuisinier',   desc:'Cuisine à domicile',     color:'#0369A1', bg:'#DBEAFE', Icon: ChefHat       },
  { label:'Sécurité 24h',     desc:'Gardiennage & surveillance',color:'#7C3AED',bg:'#F3E8FF',Icon: ShieldCheck   },
  { label:'Ménage & linge',   desc:'Nettoyage quotidien',    color:'#0EA5E9', bg:'#E0F2FE', Icon: Sparkles      },
]

const TESTIMONIALS = [
  { stars:5, text:'Appartement impeccable, exactement comme sur les photos. Réponse WhatsApp en 10 minutes.', name:'Marc A.',        meta:'Paris · Séjour pro',      img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { stars:5, text:'Séjour de 3 semaines, WiFi rapide, parking sécurisé. Service chef cuisinier excellent !', name:'Sophie K.',      meta:'Bruxelles · Longue durée', img:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face' },
  { stars:5, text:'Cadre magnifique, vue sur l\'océan. Paiement MTN MoMo très pratique !',                  name:'Jean-Pierre M.', meta:'Pointe-Noire · Famille',   img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
]

const FILTERS = ['Tous', 'Studios', 'T2 / T3', 'Penthouse', 'Villas', 'Services']

// ── Props depuis le Server Component ────────────────
type Props = {
  homepage?: Record<string, unknown> | null
  navigation?: Record<string, unknown> | null
  footerConfig?: Record<string, unknown> | null
  reseauxSociaux?: Record<string, unknown> | null
  appartements?: AptItem[]
  publications?: unknown[]
}

export default function HomeClient({ homepage, navigation, footerConfig, reseauxSociaux, appartements = [], publications = [] }: Props) {
  const [filter, setFilter] = useState('Tous')
  const [modal,  setModal]  = useState<ModalApt>(null)

  const apts = appartements.length > 0 ? appartements : DEMO_APTS
  const hp   = homepage     as Record<string, string | number | boolean> | null
  const nav  = navigation   as Record<string, string> | null
  const fc   = footerConfig as Record<string, string> | null
  const rs   = reseauxSociaux as Record<string, string | boolean> | null

  const heroTitre   = (hp?.hero_titre        as string) || 'Réservez votre résidence à Pointe-Noire'
  const heroSousTitre = (hp?.hero_sous_titre as string) || 'Appartements meublés haut de gamme · Confirmation WhatsApp en 30 min'
  const heroBg      = (hp?.hero_image_url_defaut as string) || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&h=900&fit=crop'
  const statRes     = (hp?.stat_residences   as number) || 48
  const statPrix    = (hp?.stat_prix_min     as number) || 45000
  const statNote    = (hp?.stat_note         as number) || 4.9
  const statConfirm = (hp?.stat_confirmation as string) || '< 30 min'
  const catLabel    = (hp?.catalogue_label   as string) || 'Notre sélection'
  const catTitre    = (hp?.catalogue_titre   as string) || 'Appartements disponibles'
  const humLabel    = (hp?.humain_label      as string) || 'Recherche simplifiée'
  const humTitre    = (hp?.humain_titre      as string) || 'Trouvez votre résidence idéale'
  const humTexte    = (hp?.humain_texte      as string) || 'Notre équipe vous accompagne à chaque étape.'
  const humBg       = (hp?.humain_image_url_defaut as string) || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=500&fit=crop&crop=top'
  const svcTitre    = (hp?.services_titre    as string) || 'Une expérience complète'
  const socialActif = hp?.social_actif !== false
  const socialTitre = (hp?.social_titre      as string) || 'Suivez-nous'
  const socialSous  = (hp?.social_sous_titre as string) || ''

  const openModal = (name: string, loc: string, price: number, img: string) => setModal({ name, loc, price, img })

  return (
    <>
      <Navbar
        logoNom={nav?.logo_nom}
        logoTagline={nav?.logo_tagline}
        telephone={nav?.telephone}
        agentNom={nav?.agent_nom}
        agentPhotoUrl={nav?.agent_photo_url}
      />

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative mt-[68px] flex items-center justify-center overflow-hidden"
        style={{ height: '88vh', minHeight: '560px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroBg} alt="Résidence de luxe à Pointe-Noire"
          className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'rgba(15,8,2,.52)' }} />
        <div className="relative z-10 text-center px-6 w-full max-w-[820px]">
          <h1 className="font-black text-white mb-3 leading-tight tracking-tight"
            style={{ fontSize: 'clamp(36px,5.5vw,68px)', fontFamily: 'var(--font-heading)', letterSpacing: '-2px' }}>
            {heroTitre}
          </h1>
          <p className="mb-8 font-light" style={{ color: 'rgba(255,255,255,.72)', fontSize: '16px' }}>
            {heroSousTitre}
          </p>
          <div className="flex items-center rounded-[14px] mx-auto"
            style={{ background:'#fff', border:'1px solid #E5DDD4', boxShadow:'0 20px 60px rgba(0,0,0,.3)', maxWidth:'720px' }}>
            <Search size={18} className="ml-4 flex-shrink-0" style={{ color: '#7A6550' }} />
            <input type="text" placeholder="Où êtes-vous situé ?"
              className="flex-1 px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] placeholder:text-[#7A6550]" />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <input type="date" className="px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[130px]" title="Arrivée" />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <input type="date" className="px-4 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[130px]" title="Départ" />
            <div className="w-px h-8 bg-[#E5DDD4] flex-shrink-0" />
            <select className="px-3 py-3.5 text-[14px] bg-transparent border-none outline-none text-[#1C110A] w-[110px]">
              <option>1 voyageur</option><option>2 voyageurs</option><option>3+ voyageurs</option>
            </select>
            <button className="m-1.5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white flex-shrink-0"
              style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}>
              <Search size={14} /> Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS + FILTRES ────────────────────────────── */}
      <div className="bg-white border-b border-[#E5DDD4]">
        <div className="max-w-[1240px] mx-auto px-8 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="w-2 h-2 rounded-full" style={{ background:'#22C55E', display:'inline-block' }} />
              <strong style={{ fontFamily:'var(--font-heading)' }}>{statRes}</strong>&nbsp;résidences
            </div>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]">Dès <strong style={{ color:'#1A0E06' }}>{statPrix.toLocaleString('fr-FR')} XAF</strong>/nuit</span>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]"><strong>★ {statNote}</strong> / 5</span>
            <div className="w-px h-5 bg-[#E5DDD4]" />
            <span className="text-[13px] text-[#7A6550]">Confirmation <strong style={{ color:'#16A34A' }}>WhatsApp {statConfirm}</strong></span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
                style={{ fontFamily:'var(--font-heading)', background: filter===f?'#E07A2F':'#fff', color: filter===f?'#fff':'#1C110A', border:`1.5px solid ${filter===f?'#E07A2F':'#E5DDD4'}` }}>
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
            <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2 text-[#7A6550]">{catLabel}</div>
            <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize:'32px', fontFamily:'var(--font-heading)' }}>{catTitre}</h2>
            <div className="w-10 h-[3px] rounded-full" style={{ background:'#E07A2F' }} />
          </div>
          <a href="/appartements" className="flex items-center gap-2 text-[14px] font-bold hover:text-[#E07A2F]"
            style={{ color:'#7A6550', fontFamily:'var(--font-heading)' }}>
            Voir tout <ArrowRight size={15} />
          </a>
        </div>
        <ApartmentCarousel
          apartments={apts}
          onReserve={apt => openModal(apt.titre, `${apt.quartier}, ${apt.ville}`, apt.prix_nuit_base, apt.image_principale?.url ?? '')}
        />
      </section>

      {/* ── HUMAIN ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight:'480px' }}>
        <div className="relative overflow-hidden" style={{ minHeight:'380px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={humBg} alt="Recherche résidence" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-y-0 right-0 w-24"
            style={{ background:'linear-gradient(to right, transparent, #FBF8F4)' }} />
        </div>
        <div className="flex flex-col justify-center px-14 py-16" style={{ background:'#FBF8F4' }}>
          <div className="text-[11px] font-bold tracking-[2px] uppercase mb-3 text-[#7A6550]">{humLabel}</div>
          <h2 className="font-black text-[#1A0E06] mb-4" style={{ fontSize:'clamp(26px,3vw,36px)', fontFamily:'var(--font-heading)' }}>{humTitre}</h2>
          <p className="mb-8 leading-relaxed text-[#7A6550]" style={{ fontSize:'15px' }}>{humTexte}</p>
          <ul className="space-y-3 mb-9">
            {['Disponibilité en temps réel sur le calendrier','Paiement Airtel Money, MTN MoMo ou espèces','Confirmation WhatsApp sous 30 minutes','Services premium sur mesure disponibles'].map(item => (
              <li key={item} className="flex items-center gap-3 text-[14px] text-[#1C110A]">
                <CheckCircle2 size={18} style={{ color:'#16A34A', flexShrink:0 }} />{item}
              </li>
            ))}
          </ul>
          <a href="tel:+242064359090" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all self-start"
            style={{ background:'#E07A2F', fontFamily:'var(--font-heading)', fontSize:'14px' }}
            onMouseEnter={e => (e.currentTarget.style.background='#B85E18')}
            onMouseLeave={e => (e.currentTarget.style.background='#E07A2F')}>
            <Phone size={16} /> Parler à un agent
          </a>
        </div>
      </div>

      {/* ── TÉMOIGNAGES ───────────────────────────────── */}
      <section className="py-20" id="temoignages" style={{ background:'#FBF8F4' }}>
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2 text-[#7A6550]">Avis clients vérifiés</div>
          <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize:'32px', fontFamily:'var(--font-heading)' }}>Ce que disent nos résidents</h2>
          <div className="w-10 h-[3px] rounded-full mb-10" style={{ background:'#E07A2F' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-7 transition-all"
                style={{ border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.07)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(26,14,6,.11)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(26,14,6,.07)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[14px]" style={{ color:'#E07A2F' }}>{'★'.repeat(t.stars)}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color:'#16A34A' }}>
                    <CheckCircle2 size={11} /> Vérifié
                  </span>
                </div>
                <p className="text-[14px] leading-[1.75] italic mb-5 text-[#7A6550]">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop:'1px solid #E5DDD4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" style={{ border:'2px solid #E5DDD4' }} />
                  <div>
                    <div className="font-bold text-[14px]">{t.name}</div>
                    <div className="text-[12px] text-[#7A6550]">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────── */}
      <section className="py-20" id="services" style={{ background:'#F3EFE9' }}>
        <div className="max-w-[1240px] mx-auto px-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2 text-[#7A6550]">Services premium</div>
              <h2 className="font-black text-[#1A0E06]" style={{ fontSize:'30px', fontFamily:'var(--font-heading)' }}>{svcTitre}</h2>
              <div className="w-10 h-[3px] rounded-full mt-2" style={{ background:'#E07A2F' }} />
            </div>
            <a href="#" className="text-[13px] font-bold transition-colors"
              style={{ color:'#7A6550', fontFamily:'var(--font-heading)', border:'1.5px solid #E5DDD4', padding:'8px 16px', borderRadius:'8px', background:'#fff' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#E07A2F'; e.currentTarget.style.color='#E07A2F' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#E5DDD4'; e.currentTarget.style.color='#7A6550' }}>
              Voir tout
            </a>
          </div>
          <div className="grid rounded-2xl overflow-hidden"
            style={{ gridTemplateColumns:'repeat(5,1fr)', background:'#fff', border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.06)' }}>
            {SERVICES_DEFAULT.map((s, i) => (
              <div key={s.label} className="px-5 py-8 text-center transition-all cursor-default"
                style={{ borderRight: i < 4 ? '1px solid #E5DDD4' : 'none', background:'#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background='#FBF8F4')}
                onMouseLeave={e => (e.currentTarget.style.background='#fff')}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background:s.bg }}>
                  <s.Icon size={22} color={s.color} strokeWidth={1.75} />
                </div>
                <div className="font-bold text-[13px] text-[#1A0E06] mb-1" style={{ fontFamily:'var(--font-heading)' }}>{s.label}</div>
                <div className="text-[12px] text-[#7A6550] leading-snug">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL WALL ───────────────────────────────── */}
      {socialActif && (
        <SocialWall
          publications={(publications as Parameters<typeof SocialWall>[0]['publications'])}
          titre={socialTitre}
          sousTitre={socialSous}
          reseaux={rs ? {
            tiktok_url:      rs.tiktok_url      as string,
            tiktok_actif:    rs.tiktok_actif    as boolean,
            instagram_url:   rs.instagram_url   as string,
            instagram_actif: rs.instagram_actif as boolean,
            youtube_url:     rs.youtube_url     as string,
            youtube_actif:   rs.youtube_actif   as boolean,
            facebook_url:    rs.facebook_url    as string,
            facebook_actif:  rs.facebook_actif  as boolean,
          } : { tiktok_url:'https://www.tiktok.com/@rsidence.ndombi', tiktok_actif:true }}
        />
      )}

      {/* ── MAP ───────────────────────────────────────── */}
      <MapSection onReserve={openModal} />

      <Footer
        logoNom={fc?.logo_nom ?? nav?.logo_nom}
        logoTagline={fc?.logo_tagline ?? nav?.logo_tagline}
        description={fc?.description}
        adresse={fc?.adresse}
        email={fc?.email}
        telephone={fc?.telephone ?? nav?.telephone}
        copyright={fc?.copyright}
        tiktokUrl={fc?.tiktok_url}
        facebookUrl={fc?.facebook_url}
        instagramUrl={fc?.instagram_url}
        youtubeUrl={fc?.youtube_url}
        whatsappUrl={fc?.whatsapp_url}
      />
      <ChatBot />
      <BookingModal apt={modal} onClose={() => setModal(null)} />
    </>
  )
}

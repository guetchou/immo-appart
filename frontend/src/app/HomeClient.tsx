'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { CheckCircle2, Phone, ArrowRight, Car, ConciergeBell, ChefHat, ShieldCheck, Sparkles, Bed, Shield, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Appartement } from '@/types/strapi'
import Navbar            from '@/components/layout/Navbar'
import HeroSearch        from '@/components/hero/HeroSearch'
import Footer            from '@/components/layout/Footer'
import ChatBot           from '@/components/layout/ChatBot'
import ApartmentCarousel from '@/components/appartement/ApartmentCarousel'
import BookingModal      from '@/components/reservation/BookingModal'
import SocialWall        from '@/components/social/SocialWall'

const MapSection = dynamic(() => import('@/components/appartement/MapSection'), { ssr: false })

// ── Types ────────────────────────────────────────────
type AptItem = Pick<Appartement,
  'id' | 'documentId' | 'titre' | 'slug' | 'quartier' | 'ville' |
  'prix_nuit_base' | 'devise' | 'type_logement' | 'nombre_chambres' |
  'superficie' | 'duree_min_sejour' | 'note_moyenne' | 'nombre_avis' |
  'en_vedette' | 'nouveau' | 'statut' | 'latitude' | 'longitude'
> & { image_principale?: { url: string; alternativeText: string | null } }

type AvisItem = {
  id: number; documentId: string
  prenom_auteur: string; initiale_nom?: string
  note_globale: number; commentaire: string
  photo_url?: string; origine?: string; verifie?: boolean
}

type ServiceItem = {
  id: number; documentId: string
  nom: string; description: string
  icone?: string; categorie?: string
  prix?: number; disponible?: boolean
}

type NavLink       = { label: string; href: string }
type FooterColonne = { titre: string; liens: { label: string; href: string }[] }
type ModalApt      = { name: string; loc: string; price: number; img: string; documentId?: string } | null

// ── Icon mapping Lucide ──────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Car, ConciergeBell, ChefHat, ShieldCheck, Sparkles, Bed, Shield, Star,
  car: Car, concierge_bell: ConciergeBell, chef_hat: ChefHat,
  shield_check: ShieldCheck, sparkles: Sparkles,
}

const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  transport:    { color: '#E07A2F', bg: '#FEF0E6' },
  concierge:    { color: '#16A34A', bg: '#DCFCE7' },
  restauration: { color: '#0369A1', bg: '#DBEAFE' },
  securite:     { color: '#7C3AED', bg: '#F3E8FF' },
  menage:       { color: '#0EA5E9', bg: '#E0F2FE' },
  bien_etre:    { color: '#DB2777', bg: '#FCE7F3' },
  autre:        { color: '#6B7280', bg: '#F3F4F6' },
}

const FILTERS = ['Tous', 'Studios', 'T2 / T3', 'Penthouse', 'Villas', 'Services']

// ── Props depuis le Server Component ────────────────
type Props = {
  homepage?:        Record<string, unknown> | null
  navigation?:      Record<string, unknown> | null
  footerConfig?:    Record<string, unknown> | null
  reseauxSociaux?:  Record<string, unknown> | null
  appartements?:    AptItem[]
  publications?:    unknown[]
  servicesPremium?: ServiceItem[]
  avis?:            AvisItem[]
}

export default function HomeClient({
  homepage, navigation, footerConfig, reseauxSociaux,
  appartements = [], publications = [],
  servicesPremium = [], avis = [],
}: Props) {
  const [filter, setFilter] = useState('Tous')
  const [modal,  setModal]  = useState<ModalApt>(null)

  const hp  = homepage     as Record<string, string | number | boolean> | null
  const nav = navigation   as Record<string, unknown> | null
  const fc  = footerConfig as Record<string, unknown> | null
  const rs  = reseauxSociaux as Record<string, string | boolean> | null

  const heroTitre    = (hp?.hero_titre        as string) || 'Réservez votre résidence à Pointe-Noire'
  const heroSousTitre= (hp?.hero_sous_titre   as string) || 'Appartements meublés haut de gamme · Confirmation WhatsApp en 30 min'
  const heroBg       = (hp?.hero_image_url_defaut as string) || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&h=900&fit=crop'
  const statRes      = (hp?.stat_residences   as number) || 48
  const statPrix     = (hp?.stat_prix_min     as number) || 45000
  const statNote     = (hp?.stat_note         as number) || 4.9
  const statConfirm  = (hp?.stat_confirmation as string) || '< 30 min'
  const catLabel     = (hp?.catalogue_label   as string) || 'Notre sélection'
  const catTitre     = (hp?.catalogue_titre   as string) || 'Appartements disponibles'
  const humLabel     = (hp?.humain_label      as string) || 'Recherche simplifiée'
  const humTitre     = (hp?.humain_titre      as string) || 'Trouvez votre résidence idéale'
  const humTexte     = (hp?.humain_texte      as string) || 'Notre équipe vous accompagne à chaque étape.'
  const humBg        = (hp?.humain_image_url_defaut as string) || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=500&fit=crop&crop=top'
  const svcTitre     = (hp?.services_titre    as string) || 'Une expérience complète'
  const socialActif  = hp?.social_actif !== false
  const socialTitre  = (hp?.social_titre      as string) || 'Suivez-nous'
  const socialSous   = (hp?.social_sous_titre as string) || ''

  // Nav links from Strapi
  const liensNav  = (nav?.liens_nav  as NavLink[]      | null) ?? undefined
  // Footer columns from Strapi
  const colonnesLiens = (fc?.colonnes_liens as FooterColonne[] | null) ?? undefined

  // Map: appartements with GPS → pins
  const residences = appartements
    .filter(a => a.latitude && a.longitude)
    .map(a => ({
      lat:   a.latitude!,
      lng:   a.longitude!,
      name:  a.titre,
      loc:   a.quartier,
      price: a.prix_nuit_base.toLocaleString('fr-FR'),
      pr:    a.prix_nuit_base,
      img:   a.image_principale?.url ?? 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=80&h=80&fit=crop',
    }))

  const openModal = (name: string, loc: string, price: number, img: string, documentId?: string) =>
    setModal({ name, loc, price, img, documentId })

  const handleSearch = ({ query, arrivee, depart, pers, apt }: {
    query: string; arrivee: string; depart: string; pers: number
    apt?: { titre: string; quartier: string; ville: string; prix_nuit_base: number; image_principale?: { url: string } }
  }) => {
    if (apt) {
      openModal(apt.titre, `${apt.quartier}, ${apt.ville}`, apt.prix_nuit_base, apt.image_principale?.url ?? '', (apt as { documentId?: string }).documentId)
    } else {
      // Recherche libre → navigue vers le catalogue avec filtres
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (arrivee) params.set('arrivee', arrivee)
      if (depart) params.set('depart', depart)
      if (pers > 1) params.set('pers', String(pers))
      window.location.href = `/appartements?${params.toString()}`
    }
  }

  return (
    <>
      <Navbar
        logoNom={nav?.logo_nom as string | undefined}
        logoTagline={nav?.logo_tagline as string | undefined}
        telephone={nav?.telephone as string | undefined}
        agentNom={nav?.agent_nom as string | undefined}
        agentPhotoUrl={nav?.agent_photo_url as string | undefined}
        liensNav={liensNav}
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
          <HeroSearch appartements={appartements} onSearch={handleSearch} />
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
      {appartements.length > 0 && (
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
            apartments={appartements}
            onReserve={apt => openModal(apt.titre, `${apt.quartier}, ${apt.ville}`, apt.prix_nuit_base, apt.image_principale?.url ?? '', apt.documentId)}
          />
        </section>
      )}

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
      {avis.length > 0 && (
        <section className="py-20" id="temoignages" style={{ background:'#FBF8F4' }}>
          <div className="max-w-[1240px] mx-auto px-10">
            <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2 text-[#7A6550]">Avis clients vérifiés</div>
            <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize:'32px', fontFamily:'var(--font-heading)' }}>Ce que disent nos résidents</h2>
            <div className="w-10 h-[3px] rounded-full mb-10" style={{ background:'#E07A2F' }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {avis.map(t => (
                <div key={t.id} className="bg-white rounded-2xl p-7 transition-all"
                  style={{ border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(26,14,6,.11)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(26,14,6,.07)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[14px]" style={{ color:'#E07A2F' }}>{'★'.repeat(Math.round(t.note_globale))}</span>
                    {t.verifie && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color:'#16A34A' }}>
                        <CheckCircle2 size={11} /> Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] leading-[1.75] italic mb-5 text-[#7A6550]">&ldquo;{t.commentaire}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-4" style={{ borderTop:'1px solid #E5DDD4' }}>
                    {t.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photo_url} alt={t.prenom_auteur}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                        style={{ border:'2px solid #E5DDD4' }} />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-[15px]"
                        style={{ background:'#E07A2F', border:'2px solid #E5DDD4' }}>
                        {t.prenom_auteur[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-[14px]">
                        {t.prenom_auteur}{t.initiale_nom ? ` ${t.initiale_nom}.` : ''}
                      </div>
                      {t.origine && <div className="text-[12px] text-[#7A6550]">{t.origine}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICES ──────────────────────────────────── */}
      {servicesPremium.length > 0 && (
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
              style={{ gridTemplateColumns:`repeat(${Math.min(servicesPremium.length, 5)},1fr)`, background:'#fff', border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.06)' }}>
              {servicesPremium.slice(0, 5).map((s, i) => {
                const cat     = s.categorie ?? 'autre'
                const colors  = CAT_COLORS[cat] ?? CAT_COLORS.autre
                const IconCmp = s.icone ? (ICON_MAP[s.icone] ?? Sparkles) : Sparkles
                return (
                  <div key={s.id} className="px-5 py-8 text-center transition-all cursor-default"
                    style={{ borderRight: i < servicesPremium.slice(0,5).length - 1 ? '1px solid #E5DDD4' : 'none', background:'#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.background='#FBF8F4')}
                    onMouseLeave={e => (e.currentTarget.style.background='#fff')}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: colors.bg }}>
                      <IconCmp size={22} color={colors.color} strokeWidth={1.75} />
                    </div>
                    <div className="font-bold text-[13px] text-[#1A0E06] mb-1" style={{ fontFamily:'var(--font-heading)' }}>{s.nom}</div>
                    <div className="text-[12px] text-[#7A6550] leading-snug">{s.description}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

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
      <MapSection onReserve={openModal} residences={residences} />

      <Footer
        logoNom={fc?.logo_nom        as string | undefined ?? nav?.logo_nom        as string | undefined}
        logoTagline={fc?.logo_tagline as string | undefined ?? nav?.logo_tagline    as string | undefined}
        description={fc?.description  as string | undefined}
        adresse={fc?.adresse          as string | undefined}
        email={fc?.email              as string | undefined}
        telephone={fc?.telephone      as string | undefined ?? nav?.telephone       as string | undefined}
        copyright={fc?.copyright      as string | undefined}
        tiktokUrl={fc?.tiktok_url     as string | undefined}
        facebookUrl={fc?.facebook_url as string | undefined}
        instagramUrl={fc?.instagram_url as string | undefined}
        youtubeUrl={fc?.youtube_url   as string | undefined}
        whatsappUrl={fc?.whatsapp_url as string | undefined}
        colonnesLiens={colonnesLiens}
      />
      <ChatBot />
      <BookingModal apt={modal} onClose={() => setModal(null)} />
    </>
  )
}

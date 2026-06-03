'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatBot from '@/components/layout/ChatBot'
import BookingModal from '@/components/reservation/BookingModal'
import {
  ArrowLeft, MapPin, BedDouble, Bath, Maximize2, Users,
  Clock, CheckCircle2, Star, ChevronLeft, ChevronRight,
  Wifi, Car, Shield, ChefHat, Sparkles, Play, MessageSquarePlus
} from 'lucide-react'
import AvisModal from '@/components/avis/AvisModal'
import { toStrapiPublicUrl } from '@/lib/strapi-url'

function imgUrl(url?: string) {
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=600&fit=crop'
  return toStrapiPublicUrl(url) ?? url
}

const ICON_MAP: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  'wifi': Wifi, 'voiture': Car, 'securite': Shield, 'cuisine': ChefHat, 'menage': Sparkles,
}

type ModalApt = { name: string; loc: string; price: number; img: string; documentId?: string } | null

export default function AppartementClient({ apt }: { apt: Record<string, unknown> }) {
  const [imgIdx,    setImgIdx]   = useState(0)
  const [modal,     setModal]   = useState<ModalApt>(null)
  const [showAvis,  setShowAvis] = useState(false)

  const titre    = apt.titre    as string
  const quartier = apt.quartier as string
  const ville    = apt.ville    as string
  const prix     = apt.prix_nuit_base as number
  const devise   = apt.devise   as string ?? 'XAF'
  const desc     = apt.description_courte as string
  const descFull = apt.description as string
  const surface  = apt.superficie as number | null
  const chambres = apt.nombre_chambres as number
  const sdb      = apt.nombre_salles_bain as number
  const capa     = apt.capacite_personnes as number
  const checkin  = apt.heure_checkin  as string ?? '14:00'
  const checkout = apt.heure_checkout as string ?? '11:00'
  const noteM    = apt.note_moyenne as number | null
  const nbrAvis  = apt.nombre_avis  as number ?? 0
  const politique= apt.politique_annulation as string ?? 'moderee'

  const imgPrinc = apt.image_principale as { url: string } | null
  const galerie  = (apt.galerie  as { url: string }[] | null) ?? []
  const equipements = (apt.equipements as { nom: string; icone?: string; premium?: boolean }[] | null) ?? []
  const avis      = (apt.avis as { id: number; prenom_auteur: string; note_globale: number; commentaire: string; verifie: boolean; date_sejour?: string }[] | null) ?? []
  const videoUrl  = apt.video_url as string | null
  const documentId = apt.documentId as string

  const images = [imgPrinc?.url, ...galerie.map(g => g.url)].filter(Boolean) as string[]

  // Extraire l'ID vidéo selon la plateforme
  function getEmbedUrl(url: string): { embedUrl: string; type: 'tiktok' | 'youtube' | 'other' } | null {
    if (!url) return null
    // TikTok
    const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/)
    if (ttMatch) return { embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`, type: 'tiktok' }
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
    if (ytMatch) return { embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`, type: 'youtube' }
    return null
  }

  const videoEmbed = videoUrl ? getEmbedUrl(videoUrl) : null

  const politiqueLabel: Record<string, string> = {
    flexible:         'Flexible — remboursement intégral sous 48h',
    moderee:          'Modérée — remboursement 50% jusqu\'à 5 jours avant',
    stricte:          'Stricte — non remboursable à partir de 14 jours avant',
    non_remboursable: 'Non remboursable',
  }

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">

        {/* ── Galerie ── */}
        <div className="relative bg-[#1A0E06]" style={{ height: '55vh', minHeight: '380px' }}>
          {images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl(images[imgIdx])} alt={titre}
                className="w-full h-full object-cover opacity-90" />

              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background:'rgba(255,255,255,.9)', color:'#1A0E06' }}
                    aria-label="Photo précédente">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background:'rgba(255,255,255,.9)', color:'#1A0E06' }}
                    aria-label="Photo suivante">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)}
                        className="rounded-full transition-all"
                        style={{ width: i===imgIdx?'24px':'8px', height:'8px', background: i===imgIdx?'#E07A2F':'rgba(255,255,255,.6)' }} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#7A6550]">Aucune photo</div>
          )}
        </div>

        {/* ── Contenu ── */}
        <div className="max-w-[1100px] mx-auto px-8 py-10">
          <Link href="/appartements" className="inline-flex items-center gap-2 text-[13px] text-[#7A6550] hover:text-[#E07A2F] transition-colors mb-6">
            <ArrowLeft size={14} /> Retour aux appartements
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Colonne gauche ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Titre + infos */}
              <div>
                {noteM != null && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size={14} fill="#E07A2F" stroke="none" />
                    <span className="font-semibold text-[14px]">{noteM.toFixed(1)}</span>
                    <span className="text-[14px] text-[#7A6550]">· {nbrAvis} avis</span>
                  </div>
                )}
                <h1 className="font-black text-[#1A0E06] mb-2"
                  style={{ fontSize:'clamp(24px,3vw,36px)', fontFamily:'var(--font-heading)' }}>
                  {titre}
                </h1>
                <div className="flex items-center gap-2 text-[15px] text-[#7A6550]">
                  <MapPin size={15} className="text-[#E07A2F] flex-shrink-0" />
                  {quartier}, {ville}
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="flex flex-wrap gap-6 py-6" style={{ borderTop:'1px solid #E5DDD4', borderBottom:'1px solid #E5DDD4' }}>
                {[
                  { icon:<BedDouble size={20}/>, label:'Chambres',  val: chambres ?? '—' },
                  { icon:<Bath size={20}/>,      label:'Sdb',       val: sdb ?? '—'      },
                  { icon:<Users size={20}/>,     label:'Personnes', val: capa ?? '—'     },
                  { icon:<Maximize2 size={20}/>, label:'Superficie',val: surface ? `${surface} m²` : '—' },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'#F3EFE9', color:'#7A6550' }}>
                      {c.icon}
                    </div>
                    <div>
                      <div className="font-black text-[16px] text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>{c.val}</div>
                      <div className="text-[12px] text-[#7A6550]">{c.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {desc && (
                <div>
                  <h2 className="font-black text-[18px] text-[#1A0E06] mb-3" style={{ fontFamily:'var(--font-heading)' }}>Description</h2>
                  <p className="text-[#7A6550] leading-relaxed text-[15px]">{desc}</p>
                  {descFull && descFull !== desc && (
                    <p className="text-[#7A6550] leading-relaxed text-[15px] mt-3">{descFull}</p>
                  )}
                </div>
              )}

              {/* Équipements */}
              {equipements.length > 0 && (
                <div>
                  <h2 className="font-black text-[18px] text-[#1A0E06] mb-4" style={{ fontFamily:'var(--font-heading)' }}>Équipements</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {equipements.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-[14px] text-[#1C110A]">
                        <CheckCircle2 size={15} className="text-[#16A34A] flex-shrink-0" />
                        {eq.nom}
                        {eq.premium && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background:'#FEF0E6', color:'#E07A2F' }}>Premium</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Horaires */}
              <div>
                <h2 className="font-black text-[18px] text-[#1A0E06] mb-3" style={{ fontFamily:'var(--font-heading)' }}>Horaires</h2>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-[14px]">
                    <Clock size={15} className="text-[#E07A2F]" />
                    <span className="text-[#7A6550]">Check-in :</span>
                    <strong>{checkin}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-[14px]">
                    <Clock size={15} className="text-[#0369A1]" />
                    <span className="text-[#7A6550]">Check-out :</span>
                    <strong>{checkout}</strong>
                  </div>
                </div>
              </div>

              {/* Annulation */}
              <div className="rounded-xl px-5 py-4" style={{ background:'#F3EFE9', border:'1px solid #E5DDD4' }}>
                <h2 className="font-bold text-[15px] text-[#1A0E06] mb-1">Politique d&apos;annulation</h2>
                <p className="text-[14px] text-[#7A6550]">{politiqueLabel[politique] ?? politique}</p>
              </div>

              {/* Vidéo TikTok / YouTube */}
              {videoEmbed && (
                <div>
                  <h2 className="font-black text-[18px] text-[#1A0E06] mb-4 flex items-center gap-2" style={{ fontFamily:'var(--font-heading)' }}>
                    <Play size={18} style={{ color:'#E07A2F' }} /> Visite vidéo
                  </h2>
                  <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid #E5DDD4', boxShadow:'0 4px 16px rgba(26,14,6,.08)' }}>
                    {videoEmbed.type === 'tiktok' ? (
                      <div className="flex justify-center bg-[#1A0E06] py-4">
                        <iframe
                          src={videoEmbed.embedUrl}
                          style={{ width:'325px', height:'580px', border:'none' }}
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          title="Vidéo TikTok"
                        />
                      </div>
                    ) : (
                      <div className="relative" style={{ paddingBottom:'56.25%', height:0 }}>
                        <iframe
                          src={videoEmbed.embedUrl}
                          className="absolute inset-0 w-full h-full"
                          style={{ border:'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Vidéo"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Avis */}
              {avis.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-black text-[18px] text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>
                      Avis clients {noteM != null && <span className="text-[#E07A2F]"> ★ {noteM.toFixed(1)}</span>}
                    </h2>
                    <button onClick={() => setShowAvis(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all"
                      style={{ border:'1.5px solid #E07A2F', color:'#E07A2F', fontFamily:'var(--font-heading)' }}
                      onMouseEnter={e => { e.currentTarget.style.background='#FEF0E6' }}
                      onMouseLeave={e => { e.currentTarget.style.background='transparent' }}>
                      <MessageSquarePlus size={14} /> Laisser un avis
                    </button>
                  </div>
                  <div className="space-y-4">
                    {avis.slice(0,5).map(av => (
                      <div key={av.id} className="rounded-xl p-5 bg-white" style={{ border:'1px solid #E5DDD4' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] text-white"
                              style={{ background:'#E07A2F' }}>{av.prenom_auteur[0]}</div>
                            <span className="font-semibold text-[14px]">{av.prenom_auteur}</span>
                            {av.verifie && <CheckCircle2 size={13} className="text-[#16A34A]" />}
                          </div>
                          <span className="text-[13px]" style={{ color:'#E07A2F' }}>{'★'.repeat(Math.round(av.note_globale))}</span>
                        </div>
                        <p className="text-[14px] text-[#7A6550] leading-relaxed">{av.commentaire}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Sticky booking card ── */}
            <div className="lg:sticky lg:top-[88px] self-start">
              <div className="rounded-2xl p-6 bg-white" style={{ border:'1px solid #E5DDD4', boxShadow:'0 8px 32px rgba(26,14,6,.10)' }}>
                <div className="mb-5">
                  <span className="font-black text-[28px] text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>
                    {prix.toLocaleString('fr-FR')}
                  </span>
                  <span className="text-[14px] text-[#7A6550]"> {devise} / nuit</span>
                </div>

                <button
                  onClick={() => setModal({ name: titre, loc: `${quartier}, ${ville}`, price: prix, img: imgUrl(images[0]), documentId })}
                  className="w-full py-4 rounded-xl font-black text-white text-[15px] transition-all mb-4"
                  style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}
                  onMouseEnter={e => (e.currentTarget.style.background='#B85E18')}
                  onMouseLeave={e => (e.currentTarget.style.background='#E07A2F')}>
                  Réserver maintenant
                </button>

                <a href="tel:+242064359090"
                  className="w-full py-3 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2"
                  style={{ background:'transparent', border:'1.5px solid #E5DDD4', color:'#1A0E06', fontFamily:'var(--font-heading)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#E07A2F'; e.currentTarget.style.color='#E07A2F' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#E5DDD4'; e.currentTarget.style.color='#1A0E06' }}>
                  Appeler : +242 06 435 90 90
                </a>

                <div className="mt-5 pt-5 space-y-2" style={{ borderTop:'1px solid #E5DDD4' }}>
                  {[
                    'Confirmation WhatsApp sous 30 min',
                    'Paiement sur place — Airtel · MTN · Espèces',
                    'Annulation selon politique ci-dessus',
                  ].map(t => (
                    <div key={t} className="flex items-center gap-2 text-[12px] text-[#7A6550]">
                      <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <ChatBot />
      <BookingModal apt={modal} onClose={() => setModal(null)} />
      <AvisModal
        open={showAvis}
        appartementId={documentId}
        appartementTitre={titre}
        onClose={() => setShowAvis(false)}
      />
    </>
  )
}

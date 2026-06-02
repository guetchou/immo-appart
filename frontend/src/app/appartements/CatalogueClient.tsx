'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatBot from '@/components/layout/ChatBot'
import { MapPin, BedDouble, Maximize2, Clock, Search, SlidersHorizontal, Heart } from 'lucide-react'

type Apt = {
  id: number; documentId: string; titre: string; slug: string
  quartier: string; ville: string; prix_nuit_base: number; devise: string
  type_logement: string; nombre_chambres: number; superficie?: number
  duree_min_sejour: number; note_moyenne?: number; nombre_avis: number
  en_vedette: boolean; nouveau: boolean; statut: string
  image_principale?: { url: string; alternativeText?: string }
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TYPE_LABELS: Record<string, string> = {
  studio:'Studio', t1:'T1', t2:'T2', t3:'T3', t4:'T4', t5_plus:'T5+',
  villa:'Villa', penthouse:'Penthouse', duplex:'Duplex', loft:'Loft',
}
const FILTERS = ['Tous', 'Studios', 'T2 / T3', 'Penthouse', 'Villas', 'Lofts']

function imgUrl(apt: Apt) {
  const url = apt.image_principale?.url
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop'
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`
}

function matchFilter(apt: Apt, filter: string) {
  if (filter === 'Tous') return true
  if (filter === 'Studios') return apt.type_logement === 'studio'
  if (filter === 'T2 / T3') return ['t2','t3'].includes(apt.type_logement)
  if (filter === 'Penthouse') return apt.type_logement === 'penthouse'
  if (filter === 'Villas') return apt.type_logement === 'villa'
  if (filter === 'Lofts') return apt.type_logement === 'loft'
  return true
}

export default function CatalogueClient({ appartements }: { appartements: Apt[] }) {
  const [filter, setFilter] = useState('Tous')
  const [search, setSearch] = useState('')
  const [favs,   setFavs]   = useState<Set<number>>(new Set())

  const filtered = appartements.filter(a =>
    matchFilter(a, filter) &&
    (!search || a.titre.toLowerCase().includes(search.toLowerCase()) || a.quartier.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">
        {/* ── Header ── */}
        <div className="py-14 px-8" style={{ background: '#FBF8F4', borderBottom: '1px solid #E5DDD4' }}>
          <div className="max-w-[1240px] mx-auto">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#7A6550] mb-2">Nos résidences</div>
            <h1 className="font-black text-[#1A0E06] mb-1" style={{ fontSize: 'clamp(28px,4vw,42px)', fontFamily:'var(--font-heading)' }}>
              Appartements disponibles
            </h1>
            <p className="text-[#7A6550]">Foucks & environs · Pointe-Noire, République du Congo</p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="sticky top-[68px] z-40 bg-white border-b border-[#E5DDD4] px-8 py-3">
          <div className="max-w-[1240px] mx-auto flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[300px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6550]" />
              <input
                type="text"
                placeholder="Chercher un quartier, type…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ border:'1.5px solid #E5DDD4', background:'#FBF8F4' }}
                onFocus={e => (e.target.style.borderColor='#E07A2F')}
                onBlur={e => (e.target.style.borderColor='#E5DDD4')}
              />
            </div>
            {/* Type chips */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                  style={{ fontFamily:'var(--font-heading)', background:filter===f?'#E07A2F':'transparent', color:filter===f?'#fff':'#7A6550', border:`1.5px solid ${filter===f?'#E07A2F':'#E5DDD4'}` }}>
                  {f}
                </button>
              ))}
            </div>
            <div className="ml-auto text-[13px] text-[#7A6550]">
              <strong className="text-[#1A0E06]">{filtered.length}</strong> résidence{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="max-w-[1240px] mx-auto px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#F3EFE9] flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={28} className="text-[#7A6550]" />
              </div>
              <p className="font-bold text-[#1A0E06] text-[16px] mb-1" style={{ fontFamily:'var(--font-heading)' }}>
                {appartements.length === 0 ? 'Aucun appartement disponible pour le moment' : 'Aucun résultat'}
              </p>
              <p className="text-[#7A6550] text-[14px]">
                {appartements.length === 0
                  ? 'Revenez bientôt — nos résidences seront publiées prochainement.'
                  : 'Modifiez vos filtres pour voir plus de résidences.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(apt => {
                const isFav = favs.has(apt.id)
                const badge = apt.en_vedette ? {l:'En vedette', bg:'#FEF0E6', c:'#E07A2F'}
                            : apt.nouveau    ? {l:'Nouveau',    bg:'#DCFCE7', c:'#16A34A'} : null
                return (
                  <article key={apt.id}
                    className="rounded-2xl overflow-hidden bg-white group cursor-pointer transition-all"
                    style={{ border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.07)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='0 20px 50px rgba(26,14,6,.14)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(26,14,6,.07)' }}>

                    {/* Image */}
                    <div className="relative h-[210px] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl(apt)} alt={apt.image_principale?.alternativeText ?? apt.titre}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                      {badge && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{ background:badge.bg, color:badge.c }}>{badge.l}</span>
                      )}
                      <button
                        onClick={e => { e.preventDefault(); setFavs(s => { const n=new Set(s); isFav?n.delete(apt.id):n.add(apt.id); return n }) }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,.9)' }}
                        aria-label="Favori">
                        <Heart size={15} fill={isFav?'#E07A2F':'none'} stroke={isFav?'#E07A2F':'#7A6550'} />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      {apt.note_moyenne != null && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[12px]" style={{ color:'#E07A2F' }}>★</span>
                          <span className="text-[12px] font-semibold">{apt.note_moyenne.toFixed(1)}</span>
                          <span className="text-[12px] text-[#7A6550]">({apt.nombre_avis})</span>
                        </div>
                      )}
                      <h2 className="font-black text-[15px] text-[#1A0E06] mb-1 truncate" style={{ fontFamily:'var(--font-heading)' }}>
                        {apt.titre}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[13px] text-[#7A6550] mb-3">
                        <MapPin size={12} className="text-[#7A6550] flex-shrink-0" />
                        <span className="truncate">{apt.quartier}, {apt.ville}</span>
                      </div>
                      <div className="flex gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#7A6550]">
                          <BedDouble size={12} className="text-[#0369A1]" />
                          {TYPE_LABELS[apt.type_logement] ?? apt.type_logement}
                        </div>
                        {apt.superficie && (
                          <div className="flex items-center gap-1.5 text-[12px] text-[#7A6550]">
                            <Maximize2 size={12} className="text-[#0369A1]" />
                            {apt.superficie} m²
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[12px] text-[#7A6550]">
                          <Clock size={12} className="text-[#0369A1]" />
                          Min {apt.duree_min_sejour}n
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3.5" style={{ borderTop:'1px solid #E5DDD4' }}>
                        <div>
                          <span className="text-[19px] font-black text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>
                            {apt.prix_nuit_base.toLocaleString('fr-FR')}
                          </span>
                          <span className="text-[12px] text-[#7A6550]"> {apt.devise}/nuit</span>
                        </div>
                        <Link href={`/appartements/${apt.slug}`}
                          className="px-4 py-2 rounded-lg text-[13px] font-bold text-white transition-all"
                          style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#B85E18')}
                          onMouseLeave={e => (e.currentTarget.style.background='#E07A2F')}>
                          Voir
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ChatBot />
    </>
  )
}

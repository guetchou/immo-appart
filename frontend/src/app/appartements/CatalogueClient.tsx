'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navbar  from '@/components/layout/Navbar'
import type { NavProps } from '@/components/layout/Navbar'
import Footer  from '@/components/layout/Footer'
import ChatBot from '@/components/layout/ChatBot'
import BookingModal from '@/components/reservation/BookingModal'
import { toStrapiPublicUrl } from '@/lib/strapi-url'
import { logementTypeKey, logementTypeLabel, type TypeLogementRef } from '@/lib/logement-types'
import {
  MapPin, BedDouble, Maximize2, Clock, Search,
  SlidersHorizontal, Heart, ArrowUpDown, X, Calendar, Users,
} from 'lucide-react'

type Apt = {
  id: number; documentId: string; titre: string; slug: string
  quartier: string; ville: string; prix_nuit_base: number; devise: string
  type_logement: string | null; type_logement_ref?: TypeLogementRef | null
  nombre_chambres: number; superficie: number | null
  duree_min_sejour: number; capacite_personnes?: number
  note_moyenne: number | null; nombre_avis: number
  en_vedette: boolean; nouveau: boolean; statut: string
  image_principale?: { url: string; alternativeText?: string | null }
}

type ModalApt = { name: string; loc: string; price: number; img: string; documentId?: string } | null

const TYPE_CHIPS = [
  { label: 'Tous',       types: [] },
  { label: 'Studios',    types: ['studio'] },
  { label: 'Appart. 1-2 ch.', types: ['appartement-1-chambre','appartement-2-chambres','t1','t2'] },
  { label: 'Appart. 3+ ch.', types: ['appartement-3-chambres','appartement-4-chambres','appartement-4-chambres-et-plus','t3','t4','t5_plus'] },
  { label: 'Villas',     types: ['villa'] },
  { label: 'Duplex + autres', types: ['duplex','loft','autres'] },
]

const SORTS = [
  { value: 'ordre',    label: 'Recommandés' },
  { value: 'prix_asc', label: 'Prix croissant' },
  { value: 'prix_desc',label: 'Prix décroissant' },
  { value: 'note',     label: 'Mieux notés' },
  { value: 'nouveau',  label: 'Nouveautés' },
]

function imgUrl(apt: Apt) {
  const url = apt.image_principale?.url
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop'
  return toStrapiPublicUrl(url) ?? url
}

type Props = {
  navProps?:      NavProps
  appartements:  Apt[]
  initSearch?:   string
  initArrivee?:  string
  initDepart?:   string
  initPers?:     number
}

export default function CatalogueClient({
  navProps, appartements, initSearch = '', initArrivee = '', initDepart = '', initPers = 1,
}: Props) {
  const [search,    setSearch]    = useState(initSearch)
  const [chipIdx,   setChipIdx]   = useState(0)
  const [sort,      setSort]      = useState('ordre')
  const [prixMin,   setPrixMin]   = useState('')
  const [prixMax,   setPrixMax]   = useState('')
  const [arrivee,   setArrivee]   = useState(initArrivee)
  const [depart,    setDepart]    = useState(initDepart)
  const [pers,      setPers]      = useState(initPers)
  const [showAdv,   setShowAdv]   = useState(false)
  const [favs,      setFavs]      = useState<Set<string>>(new Set())
  const [modal,     setModal]     = useState<ModalApt>(null)

  // Charger les favoris depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ndombi_favs')
      if (saved) setFavs(new Set(JSON.parse(saved)))
    } catch { /* ignore */ }
  }, [])

  const toggleFav = (documentId: string) => {
    setFavs(prev => {
      const next = new Set(prev)
      next.has(documentId) ? next.delete(documentId) : next.add(documentId)
      try { localStorage.setItem('ndombi_favs', JSON.stringify([...next])) } catch { /* ignore */ }
      return next
    })
  }

  const openModal = (apt: Apt) =>
    setModal({ name: apt.titre, loc: `${apt.quartier}, ${apt.ville}`, price: apt.prix_nuit_base, img: imgUrl(apt), documentId: apt.documentId })

  // Filtrage + tri
  const filtered = useMemo(() => {
    const chip  = TYPE_CHIPS[chipIdx]
    const minP  = prixMin ? Number(prixMin) : 0
    const maxP  = prixMax ? Number(prixMax) : Infinity

    let result = appartements.filter(a => {
      if (chip.types.length && !chip.types.includes(logementTypeKey(a))) return false
      if (search && !a.titre.toLowerCase().includes(search.toLowerCase()) &&
                    !a.quartier.toLowerCase().includes(search.toLowerCase())) return false
      if (a.prix_nuit_base < minP || a.prix_nuit_base > maxP) return false
      if (pers > 1 && a.capacite_personnes && a.capacite_personnes < pers) return false
      return true
    })

    switch (sort) {
      case 'prix_asc':  result = [...result].sort((a,b) => a.prix_nuit_base - b.prix_nuit_base); break
      case 'prix_desc': result = [...result].sort((a,b) => b.prix_nuit_base - a.prix_nuit_base); break
      case 'note':      result = [...result].sort((a,b) => (b.note_moyenne ?? 0) - (a.note_moyenne ?? 0)); break
      case 'nouveau':   result = [...result].sort((a,b) => (b.nouveau ? 1 : 0) - (a.nouveau ? 1 : 0)); break
    }
    return result
  }, [appartements, chipIdx, search, sort, prixMin, prixMax, pers])

  const hasActiveFilters = search || prixMin || prixMax || chipIdx !== 0 || pers > 1 || arrivee || depart

  const clearAll = () => {
    setSearch(''); setChipIdx(0); setPrixMin(''); setPrixMax('')
    setArrivee(''); setDepart(''); setPers(1); setSort('ordre')
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Navbar {...navProps} />
      <main className="pt-[68px]">

        {/* ── Header ── */}
        <div className="py-12 px-8" style={{ background:'#FBF8F4', borderBottom:'1px solid #E5DDD4' }}>
          <div className="max-w-[1240px] mx-auto">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#7A6550] mb-2">Nos résidences</div>
            <h1 className="font-black text-[#1A0E06] mb-1" style={{ fontSize:'clamp(28px,4vw,42px)', fontFamily:'var(--font-heading)' }}>
              Appartements disponibles
            </h1>
            <p className="text-[#7A6550]">Foucks & environs · Pointe-Noire, République du Congo</p>

            {/* Dates & pers si venant du hero search */}
            {(arrivee || depart || pers > 1) && (
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                {arrivee && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background:'#FEF0E6', color:'#E07A2F', border:'1px solid #FDDCBC' }}>
                    <Calendar size={12} /> Arrivée : {new Date(arrivee+'T12:00').toLocaleDateString('fr-FR', {day:'numeric',month:'short'})}
                  </span>
                )}
                {depart && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background:'#FEF0E6', color:'#E07A2F', border:'1px solid #FDDCBC' }}>
                    <Calendar size={12} /> Départ : {new Date(depart+'T12:00').toLocaleDateString('fr-FR', {day:'numeric',month:'short'})}
                  </span>
                )}
                {pers > 1 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                    style={{ background:'#DBEAFE', color:'#0369A1', border:'1px solid #93C5FD' }}>
                    <Users size={12} /> {pers} voyageurs
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Barre de filtres ── */}
        <div className="sticky top-[68px] z-40 bg-white border-b border-[#E5DDD4]">
          <div className="max-w-[1240px] mx-auto px-8 py-3 flex items-center gap-3 flex-wrap">

            {/* Recherche texte */}
            <div className="relative min-w-[200px] max-w-[280px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A6550]" />
              <input type="text" placeholder="Quartier, nom…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-[13px] outline-none"
                style={{ border:'1.5px solid #E5DDD4', background:'#FBF8F4' }}
                onFocus={e => (e.target.style.borderColor='#E07A2F')}
                onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
            </div>

            {/* Chips type */}
            <div className="flex gap-1.5 flex-wrap">
              {TYPE_CHIPS.map((c, i) => (
                <button key={c.label} onClick={() => setChipIdx(i)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                  style={{ fontFamily:'var(--font-heading)', background:chipIdx===i?'#E07A2F':'transparent', color:chipIdx===i?'#fff':'#7A6550', border:`1.5px solid ${chipIdx===i?'#E07A2F':'#E5DDD4'}` }}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Tri */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-[#7A6550]" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="rounded-lg px-2 py-1.5 text-[12px] font-semibold outline-none"
                style={{ border:'1.5px solid #E5DDD4', color:'#7A6550', background:'#fff' }}>
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Filtres avancés toggle */}
            <button onClick={() => setShowAdv(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={{ border:`1.5px solid ${showAdv?'#E07A2F':'#E5DDD4'}`, color:showAdv?'#E07A2F':'#7A6550', background:showAdv?'#FEF0E6':'#fff' }}>
              <SlidersHorizontal size={13} /> Filtres
            </button>

            {/* Effacer tout */}
            {hasActiveFilters && (
              <button onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{ border:'1.5px solid #FCA5A5', color:'#B91C1C', background:'#FEE2E2' }}>
                <X size={12} /> Effacer
              </button>
            )}

            <div className="ml-auto text-[13px] text-[#7A6550]">
              <strong className="text-[#1A0E06]">{filtered.length}</strong> résidence{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Panel filtres avancés */}
          {showAdv && (
            <div className="border-t border-[#E5DDD4] bg-[#FAFAF9]">
              <div className="max-w-[1240px] mx-auto px-8 py-4 flex items-end gap-6 flex-wrap">
                {/* Prix min/max */}
                <div>
                  <div className="text-[11px] font-bold text-[#7A6550] uppercase tracking-wide mb-2">Budget / nuit (XAF)</div>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={prixMin} onChange={e => setPrixMin(e.target.value)}
                      className="w-[100px] px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border:'1.5px solid #E5DDD4' }}
                      onFocus={e => (e.target.style.borderColor='#E07A2F')}
                      onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
                    <span className="text-[#7A6550] text-[13px]">—</span>
                    <input type="number" placeholder="Max" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                      className="w-[100px] px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border:'1.5px solid #E5DDD4' }}
                      onFocus={e => (e.target.style.borderColor='#E07A2F')}
                      onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <div className="text-[11px] font-bold text-[#7A6550] uppercase tracking-wide mb-2">Dates de séjour</div>
                  <div className="flex items-center gap-2">
                    <input type="date" value={arrivee} min={today} onChange={e => { setArrivee(e.target.value); if (depart && e.target.value >= depart) setDepart('') }}
                      className="px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border:'1.5px solid #E5DDD4' }}
                      onFocus={e => (e.target.style.borderColor='#E07A2F')}
                      onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
                    <span className="text-[#7A6550] text-[13px]">→</span>
                    <input type="date" value={depart} min={arrivee || today} onChange={e => setDepart(e.target.value)}
                      className="px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ border:'1.5px solid #E5DDD4' }}
                      onFocus={e => (e.target.style.borderColor='#E07A2F')}
                      onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
                  </div>
                </div>

                {/* Voyageurs */}
                <div>
                  <div className="text-[11px] font-bold text-[#7A6550] uppercase tracking-wide mb-2">Voyageurs</div>
                  <select value={pers} onChange={e => setPers(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg text-[13px] outline-none"
                    style={{ border:'1.5px solid #E5DDD4' }}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?'voyageur':'voyageurs'}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Grille ── */}
        <div className="max-w-[1240px] mx-auto px-8 py-10">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-[#F3EFE9] flex items-center justify-center mx-auto mb-4">
                <SlidersHorizontal size={28} className="text-[#7A6550]" />
              </div>
              <p className="font-bold text-[#1A0E06] text-[16px] mb-1" style={{ fontFamily:'var(--font-heading)' }}>
                {appartements.length === 0 ? 'Aucun appartement disponible pour le moment' : 'Aucun résultat'}
              </p>
              <p className="text-[#7A6550] text-[14px] mb-5">
                {appartements.length === 0
                  ? 'Revenez bientôt — nos résidences seront publiées prochainement.'
                  : 'Modifiez vos critères pour voir plus de résidences.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearAll}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-white"
                  style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}>
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(apt => {
                const isFav = favs.has(apt.documentId)
                const badge = apt.en_vedette ? { l:'En vedette', bg:'#FEF0E6', c:'#E07A2F' }
                            : apt.nouveau    ? { l:'Nouveau',    bg:'#DCFCE7', c:'#16A34A' } : null
                return (
                  <article key={apt.documentId}
                    className="rounded-2xl overflow-hidden bg-white group transition-all"
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
                      <button onClick={e => { e.preventDefault(); toggleFav(apt.documentId) }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                        style={{ background:'rgba(255,255,255,.92)', boxShadow:'0 2px 6px rgba(0,0,0,.12)' }}
                        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
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
                        <MapPin size={12} className="flex-shrink-0" />
                        <span className="truncate">{apt.quartier}, {apt.ville}</span>
                      </div>
                      <div className="flex gap-3 mb-4 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#7A6550]">
                          <BedDouble size={12} className="text-[#0369A1]" />
                          {logementTypeLabel(apt)}
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
                        <div className="flex items-center gap-2">
                          <Link href={`/appartements/${apt.slug}`}
                            className="px-3 py-2 rounded-lg text-[12px] font-bold transition-all"
                            style={{ border:'1.5px solid #E5DDD4', color:'#7A6550', fontFamily:'var(--font-heading)' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor='#E07A2F')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor='#E5DDD4')}>
                            Détail
                          </Link>
                          <button onClick={() => openModal(apt)}
                            className="px-3 py-2 rounded-lg text-[12px] font-bold text-white transition-all"
                            style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}
                            onMouseEnter={e => (e.currentTarget.style.background='#B85E18')}
                            onMouseLeave={e => (e.currentTarget.style.background='#E07A2F')}>
                            Réserver
                          </button>
                        </div>
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
      <BookingModal apt={modal} onClose={() => setModal(null)} />
    </>
  )
}

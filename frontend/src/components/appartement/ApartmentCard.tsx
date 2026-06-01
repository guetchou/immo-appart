'use client'

import { useState } from 'react'
import { Heart, MapPin, BedDouble, Maximize2, Clock } from 'lucide-react'
import type { Appartement } from '@/types/strapi'

type Props = {
  apt: Pick<Appartement,
    'id' | 'documentId' | 'titre' | 'slug' | 'quartier' | 'ville' |
    'prix_nuit_base' | 'devise' | 'type_logement' | 'nombre_chambres' |
    'superficie' | 'duree_min_sejour' | 'note_moyenne' | 'nombre_avis' |
    'en_vedette' | 'nouveau' | 'statut'
  > & {
    image_principale?: { url: string; alternativeText: string | null }
  }
  onReserve?: (apt: Props['apt']) => void
}

const TYPE_LABELS: Record<string, string> = {
  studio: 'Studio', t1: 'T1', t2: 'T2', t3: 'T3', t4: 'T4',
  t5_plus: 'T5+', villa: 'Villa', penthouse: 'Penthouse', duplex: 'Duplex', loft: 'Loft',
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'

function imgUrl(url?: string) {
  if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=300&fit=crop'
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`
}

export default function ApartmentCard({ apt, onReserve }: Props) {
  const [fav, setFav] = useState(false)

  const badge = apt.en_vedette ? { label: 'En vedette', bg: '#FEF0E6', color: '#E07A2F' }
              : apt.nouveau    ? { label: 'Nouveau',     bg: '#DCFCE7', color: '#16A34A' }
              : apt.statut === 'disponible' ? { label: 'Disponible', bg: '#DBEAFE', color: '#0369A1' }
              : null

  return (
    <article
      className="flex-none w-[300px] rounded-2xl overflow-hidden bg-white cursor-pointer group"
      style={{ border: '1px solid #E5DDD4', boxShadow: '0 2px 8px rgba(26,14,6,.07)',
               transition: 'transform .3s, box-shadow .3s' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-6px)'
        e.currentTarget.style.boxShadow  = '0 24px 60px rgba(26,14,6,.16)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)'
        e.currentTarget.style.boxShadow  = '0 2px 8px rgba(26,14,6,.07)'
      }}
    >
      {/* Image */}
      <div className="relative h-[210px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl(apt.image_principale?.url)}
          alt={apt.image_principale?.alternativeText ?? apt.titre}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        />

        {badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        )}

        <button
          onClick={e => { e.stopPropagation(); setFav(v => !v) }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,.9)' }}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            size={16}
            fill={fav ? '#E07A2F' : 'none'}
            stroke={fav ? '#E07A2F' : '#7A6550'}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-[18px]">
        {apt.note_moyenne && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[#E07A2F] text-[12px]">★</span>
            <span className="text-[12px] font-semibold text-[#1C110A]">{apt.note_moyenne.toFixed(1)}</span>
            <span className="text-[12px] text-[#7A6550]">({apt.nombre_avis} avis)</span>
          </div>
        )}

        <h3
          className="font-black text-[15px] text-[#1A0E06] mb-1 truncate"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {apt.titre}
        </h3>

        <div className="flex items-center gap-1.5 text-[13px] text-[#7A6550] mb-3">
          <MapPin size={12} className="flex-shrink-0 text-[#E07A2F]" />
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

        <div
          className="flex items-center justify-between pt-3.5"
          style={{ borderTop: '1px solid #E5DDD4' }}
        >
          <div>
            <span
              className="text-[20px] font-black text-[#1A0E06]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {apt.prix_nuit_base.toLocaleString('fr-FR')}
            </span>
            <span className="text-[12px] text-[#7A6550]"> {apt.devise}/nuit</span>
          </div>

          <button
            onClick={() => onReserve?.(apt)}
            className="px-4 py-2 rounded-lg text-[13px] font-bold text-white transition-all"
            style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background  = '#B85E18'
              e.currentTarget.style.boxShadow   = '0 6px 18px rgba(224,122,47,.35)'
              e.currentTarget.style.transform   = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background  = '#E07A2F'
              e.currentTarget.style.boxShadow   = 'none'
              e.currentTarget.style.transform   = 'none'
            }}
          >
            Réserver
          </button>
        </div>
      </div>
    </article>
  )
}

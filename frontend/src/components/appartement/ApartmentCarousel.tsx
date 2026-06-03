'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ApartmentCard from './ApartmentCard'
import type { Appartement } from '@/types/strapi'

type AptItem = Pick<Appartement,
  'id' | 'documentId' | 'titre' | 'slug' | 'quartier' | 'ville' |
  'prix_nuit_base' | 'devise' | 'type_logement' | 'type_logement_ref' | 'nombre_chambres' |
  'superficie' | 'duree_min_sejour' | 'note_moyenne' | 'nombre_avis' |
  'en_vedette' | 'nouveau' | 'statut'
> & { image_principale?: { url: string; alternativeText: string | null } }

type Props = {
  apartments: AptItem[]
  onReserve?: (apt: AptItem) => void
}

export default function ApartmentCarousel({ apartments, onReserve }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [dotIdx,  setDotIdx]  = useState(0)

  const update = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
    setDotIdx(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', update)
    emblaApi.on('reInit', update)
    update()
  }, [emblaApi, update])

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div>
      {/* Track */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-10 pb-2">
          {apartments.map(apt => (
            <ApartmentCard key={apt.id} apt={apt} onReserve={onReserve} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 mt-5">
        <button
          onClick={prev}
          disabled={!canPrev}
          aria-label="Précédent"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
          style={{
            background: '#fff',
            border: '1.5px solid #E5DDD4',
            color: canPrev ? '#1A0E06' : '#E5DDD4',
            cursor: canPrev ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canPrev) { e.currentTarget.style.background = '#E07A2F'; e.currentTarget.style.borderColor = '#E07A2F'; e.currentTarget.style.color = '#fff' } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5DDD4'; e.currentTarget.style.color = canPrev ? '#1A0E06' : '#E5DDD4' }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dots */}
        <div className="flex gap-2 items-center">
          {apartments.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="rounded-full transition-all"
              style={{
                width:   i === dotIdx ? '24px' : '8px',
                height:  '8px',
                background: i === dotIdx ? '#E07A2F' : '#E5DDD4',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={!canNext}
          aria-label="Suivant"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
          style={{
            background: '#fff',
            border: '1.5px solid #E5DDD4',
            color: canNext ? '#1A0E06' : '#E5DDD4',
            cursor: canNext ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => { if (canNext) { e.currentTarget.style.background = '#E07A2F'; e.currentTarget.style.borderColor = '#E07A2F'; e.currentTarget.style.color = '#fff' } }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E5DDD4'; e.currentTarget.style.color = canNext ? '#1A0E06' : '#E5DDD4' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

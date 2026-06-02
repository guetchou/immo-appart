'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, MapPin, Loader2, X, Calendar, Users } from 'lucide-react'

type AptSuggestion = {
  documentId: string
  slug: string
  titre: string
  quartier: string
  ville: string
  prix_nuit_base: number
  latitude: number
  longitude: number
  image_principale?: { url: string }
}

type Suggestion = {
  label: string
  sublabel: string
  type: 'geo' | 'quartier' | 'appartement'
  apt?: AptSuggestion
}

type Props = {
  appartements?: AptSuggestion[]
  onSearch: (params: {
    query: string; arrivee: string; depart: string; pers: number
    apt?: AptSuggestion
  }) => void
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function HeroSearch({ appartements = [], onSearch }: Props) {
  const [query,       setQuery]      = useState('')
  const [arrivee,     setArrivee]    = useState('')
  const [depart,      setDepart]     = useState('')
  const [pers,        setPers]       = useState(1)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDrop,    setShowDrop]   = useState(false)
  const [geoLoading,  setGeoLoading] = useState(false)
  const [selectedApt, setSelectedApt] = useState<AptSuggestion | null>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const dropRef   = useRef<HTMLDivElement>(null)
  const geoRef    = useRef<{ lat: number; lng: number } | null>(null)

  const today = new Date().toISOString().split('T')[0]

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropRef.current?.contains(e.target as Node) &&
          !inputRef.current?.contains(e.target as Node)) {
        setShowDrop(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Build suggestions from query or geo
  const buildSuggestions = useCallback((q: string, userLat?: number, userLng?: number): Suggestion[] => {
    if (!appartements.length) return []

    const lq = q.toLowerCase().trim()

    if (!lq && userLat && userLng) {
      // Géolocalisation : trier par distance
      const withDist = appartements
        .filter(a => a.latitude && a.longitude)
        .map(a => ({
          a,
          dist: haversineKm(userLat, userLng, a.latitude, a.longitude),
        }))
        .sort((x, y) => x.dist - y.dist)
        .slice(0, 5)

      // Dédoublonner par quartier
      const seen = new Set<string>()
      const sug: Suggestion[] = []
      for (const { a, dist } of withDist) {
        const key = a.quartier
        if (!seen.has(key)) {
          seen.add(key)
          sug.push({
            label: `${a.quartier}, ${a.ville}`,
            sublabel: `${dist < 1 ? Math.round(dist*1000)+'m' : dist.toFixed(1)+'km'} de vous · dès ${a.prix_nuit_base.toLocaleString('fr-FR')} XAF/nuit`,
            type: 'geo',
            apt: a,
          })
        }
      }
      return sug
    }

    if (!lq) {
      // Pas de query, pas de geo → afficher les quartiers uniques
      const seen = new Set<string>()
      return appartements.slice(0, 6).reduce<Suggestion[]>((acc, a) => {
        if (!seen.has(a.quartier)) {
          seen.add(a.quartier)
          acc.push({
            label: `${a.quartier}, ${a.ville}`,
            sublabel: `dès ${a.prix_nuit_base.toLocaleString('fr-FR')} XAF/nuit`,
            type: 'quartier',
            apt: a,
          })
        }
        return acc
      }, [])
    }

    // Recherche textuelle
    const matches = appartements.filter(a =>
      a.quartier.toLowerCase().includes(lq) ||
      a.ville.toLowerCase().includes(lq) ||
      a.titre.toLowerCase().includes(lq)
    )

    const seen = new Set<string>()
    const sug: Suggestion[] = []

    // D'abord les quartiers distincts
    for (const a of matches) {
      if (!seen.has(a.quartier) && (a.quartier.toLowerCase().includes(lq) || a.ville.toLowerCase().includes(lq))) {
        seen.add(a.quartier)
        sug.push({
          label: `${a.quartier}, ${a.ville}`,
          sublabel: `dès ${a.prix_nuit_base.toLocaleString('fr-FR')} XAF/nuit`,
          type: 'quartier',
          apt: a,
        })
      }
    }

    // Puis les appartements directs
    for (const a of matches) {
      if (a.titre.toLowerCase().includes(lq)) {
        sug.push({
          label: a.titre,
          sublabel: `${a.quartier} · ${a.prix_nuit_base.toLocaleString('fr-FR')} XAF/nuit`,
          type: 'appartement',
          apt: a,
        })
      }
    }

    return sug.slice(0, 6)
  }, [appartements])

  // Géolocalisation au focus
  const handleFocus = () => {
    setShowDrop(true)
    if (!query && !geoRef.current && navigator.geolocation) {
      setGeoLoading(true)
      navigator.geolocation.getCurrentPosition(
        pos => {
          geoRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setSuggestions(buildSuggestions('', pos.coords.latitude, pos.coords.longitude))
          setGeoLoading(false)
        },
        () => {
          setSuggestions(buildSuggestions(''))
          setGeoLoading(false)
        },
        { enableHighAccuracy: false, timeout: 5000 }
      )
    } else if (!query) {
      setSuggestions(buildSuggestions('', geoRef.current?.lat, geoRef.current?.lng))
    }
  }

  // Recherche instantanée
  const handleChange = (val: string) => {
    setQuery(val)
    setSelectedApt(null)
    setSuggestions(buildSuggestions(val, geoRef.current?.lat, geoRef.current?.lng))
    setShowDrop(true)
  }

  const selectSuggestion = (s: Suggestion) => {
    setQuery(s.label)
    setSelectedApt(s.apt ?? null)
    setShowDrop(false)
    inputRef.current?.blur()
  }

  const clearQuery = () => {
    setQuery('')
    setSelectedApt(null)
    setSuggestions(buildSuggestions('', geoRef.current?.lat, geoRef.current?.lng))
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({
      query: query || 'Pointe-Noire',
      arrivee,
      depart,
      pers,
      apt: selectedApt ?? undefined,
    })
  }

  const nights = arrivee && depart
    ? Math.max(0, Math.round((new Date(depart).getTime() - new Date(arrivee).getTime()) / 86400000))
    : 0

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-stretch rounded-[16px] mx-auto relative"
      style={{
        background: '#fff',
        border: '1px solid rgba(229,221,212,.8)',
        boxShadow: '0 24px 64px rgba(0,0,0,.28)',
        maxWidth: '780px',
      }}
    >
      {/* ── Destination ──────────────────── */}
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center px-4 h-full gap-2">
          {geoLoading
            ? <Loader2 size={17} className="flex-shrink-0 animate-spin" style={{ color: '#E07A2F' }} />
            : <MapPin size={17} className="flex-shrink-0" style={{ color: '#7A6550' }} />
          }
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-[#7A6550] uppercase tracking-[1.2px] pt-3">Destination</div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Foucks, Pointe-Noire…"
              onChange={e => handleChange(e.target.value)}
              onFocus={handleFocus}
              className="w-full pb-2.5 text-[14px] font-medium bg-transparent border-none outline-none text-[#1C110A] placeholder:text-[#B8A898]"
              autoComplete="off"
            />
          </div>
          {query && (
            <button type="button" onClick={clearQuery}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
              style={{ background: '#E5DDD4', color: '#7A6550' }}>
              <X size={11} />
            </button>
          )}
        </div>

        {/* Dropdown suggestions */}
        {showDrop && (suggestions.length > 0 || geoLoading) && (
          <div
            ref={dropRef}
            className="absolute top-[calc(100%+8px)] left-0 w-[320px] rounded-2xl overflow-hidden z-[100]"
            style={{ background: '#fff', border: '1px solid #E5DDD4', boxShadow: '0 16px 48px rgba(26,14,6,.16)' }}
          >
            {geoLoading && (
              <div className="px-4 py-3 text-[13px] text-[#7A6550] flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#E07A2F]" />
                Détection de votre position…
              </div>
            )}
            {!geoLoading && suggestions.length === 0 && query && (
              <div className="px-4 py-3 text-[13px] text-[#7A6550]">Aucun résultat pour &ldquo;{query}&rdquo;</div>
            )}
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#FBF8F4]"
                style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #F3EDE7' : 'none' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: s.type === 'geo' ? '#DBEAFE' : '#FEF0E6' }}>
                  <MapPin size={14} style={{ color: s.type === 'geo' ? '#0369A1' : '#E07A2F' }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-[#1A0E06] truncate">{s.label}</div>
                  <div className="text-[11px] text-[#7A6550] truncate">{s.sublabel}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px self-stretch my-3" style={{ background: '#E5DDD4' }} />

      {/* ── Arrivée ──────────────────────── */}
      <div className="flex items-center px-4 min-w-[130px]">
        <div className="w-full">
          <div className="flex items-center gap-1.5 pt-3">
            <Calendar size={13} style={{ color: '#7A6550' }} />
            <div className="text-[10px] font-bold text-[#7A6550] uppercase tracking-[1.2px]">Arrivée</div>
          </div>
          <input
            type="date"
            value={arrivee}
            min={today}
            onChange={e => { setArrivee(e.target.value); if (depart && e.target.value >= depart) setDepart('') }}
            className="w-full pb-2.5 text-[14px] font-medium bg-transparent border-none outline-none text-[#1C110A]"
            style={{ colorScheme: 'light' }}
          />
        </div>
      </div>

      <div className="w-px self-stretch my-3" style={{ background: '#E5DDD4' }} />

      {/* ── Départ ───────────────────────── */}
      <div className="flex items-center px-4 min-w-[130px]">
        <div className="w-full">
          <div className="flex items-center gap-1.5 pt-3">
            <Calendar size={13} style={{ color: '#7A6550' }} />
            <div className="text-[10px] font-bold text-[#7A6550] uppercase tracking-[1.2px]">Départ</div>
          </div>
          <input
            type="date"
            value={depart}
            min={arrivee || today}
            onChange={e => setDepart(e.target.value)}
            className="w-full pb-2.5 text-[14px] font-medium bg-transparent border-none outline-none text-[#1C110A]"
            style={{ colorScheme: 'light' }}
          />
        </div>
      </div>

      <div className="w-px self-stretch my-3" style={{ background: '#E5DDD4' }} />

      {/* ── Voyageurs ────────────────────── */}
      <div className="flex items-center px-4 min-w-[110px]">
        <div className="w-full">
          <div className="flex items-center gap-1.5 pt-3">
            <Users size={13} style={{ color: '#7A6550' }} />
            <div className="text-[10px] font-bold text-[#7A6550] uppercase tracking-[1.2px]">Voyageurs</div>
          </div>
          <select
            value={pers}
            onChange={e => setPers(Number(e.target.value))}
            className="w-full pb-2.5 text-[14px] font-medium bg-transparent border-none outline-none text-[#1C110A]"
          >
            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'voyageur' : 'voyageurs'}</option>)}
          </select>
        </div>
      </div>

      {/* ── Bouton Rechercher ─────────────── */}
      <div className="p-2 flex-shrink-0">
        <button
          type="submit"
          className="h-full flex items-center gap-2 px-6 rounded-[12px] font-black text-[14px] text-white transition-all"
          style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)', minHeight: '52px' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
          onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}
        >
          <Search size={16} />
          {nights > 0 ? `${nights} nuit${nights > 1 ? 's' : ''}` : 'Rechercher'}
        </button>
      </div>
    </form>
  )
}

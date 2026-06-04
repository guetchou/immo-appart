'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Crosshair, RotateCcw } from 'lucide-react'

const DEFAULT_CENTER = [-4.7761, 11.8635] as [number, number]

type ResidencePin = {
  lat: number; lng: number; name: string; loc: string
  price: string; pr: number; img: string
}

type LocalisationConfig = Record<string, unknown> & {
  actif?: boolean
  section_id?: string
  surtitre?: string
  titre?: string
  sous_titre?: string
  ville_suffix?: string
  centre_latitude?: number | string
  centre_longitude?: number | string
  zoom_initial?: number | string
  zoom_position?: number | string
  bouton_gps_idle?: string
  bouton_gps_loading?: string
  bouton_gps_done?: string
  bouton_centrer?: string
  plus_proche_label?: string
  position_popup?: string
  erreur_gps?: string
  reserver_label?: string
  prix_suffix?: string
  residence_marker_color?: string
  user_marker_color?: string
  legend_residences_label?: string
  legend_user_label?: string
  attribution_label?: string
}

type Props = {
  onReserve?:  (name: string, loc: string, price: number, img: string) => void
  residences?: ResidencePin[]
  config?: LocalisationConfig | null
}

const text = (value: unknown, fallback: string) => {
  return typeof value === 'string' && value.trim() ? value : fallback
}

const numberValue = (value: unknown, fallback: number) => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

export default function MapSection({ onReserve, residences = [], config = null }: Props) {
  const mapRef  = useRef<HTMLDivElement>(null)
  const mapObj  = useRef<L.Map | null>(null)
  const [near,   setNear]   = useState<string | null>(null)
  const [locBtn, setLocBtn] = useState<'idle' | 'loading' | 'done'>('idle')

  const sectionId = text(config?.section_id, 'localisation')
  const surtitre = text(config?.surtitre, 'Carte interactive')
  const titre = text(config?.titre, 'Nos résidences à Pointe-Noire')
  const sousTitre = text(config?.sous_titre, 'Localisez les appartements · calculez votre trajet en temps réel')
  const villeSuffix = text(config?.ville_suffix, 'Pointe-Noire')
  const centerLat = numberValue(config?.centre_latitude, DEFAULT_CENTER[0])
  const centerLng = numberValue(config?.centre_longitude, DEFAULT_CENTER[1])
  const center = useMemo(() => [centerLat, centerLng] as [number, number], [centerLat, centerLng])
  const zoomInitial = Math.round(numberValue(config?.zoom_initial, 13))
  const zoomPosition = Math.round(numberValue(config?.zoom_position, 14))
  const boutonGpsIdle = text(config?.bouton_gps_idle, 'Ma position GPS')
  const boutonGpsLoading = text(config?.bouton_gps_loading, 'Localisation…')
  const boutonGpsDone = text(config?.bouton_gps_done, 'Position trouvée')
  const boutonCentrer = text(config?.bouton_centrer, 'Centrer')
  const plusProcheLabel = text(config?.plus_proche_label, 'La plus proche')
  const positionPopup = text(config?.position_popup, 'Vous êtes ici')
  const erreurGps = text(config?.erreur_gps, 'Autorisation GPS refusée.')
  const reserverLabel = text(config?.reserver_label, 'Réserver')
  const prixSuffix = text(config?.prix_suffix, 'XAF/nuit')
  const residenceMarkerColor = text(config?.residence_marker_color, '#E07A2F')
  const userMarkerColor = text(config?.user_marker_color, '#0369A1')
  const legendResidencesLabel = text(config?.legend_residences_label, 'Résidences NDOMBI')
  const legendUserLabel = text(config?.legend_user_label, 'Votre position')
  const attributionLabel = text(config?.attribution_label, '© OpenStreetMap contributors')

  useEffect(() => {
    if (!residences.length) return
    let mounted = true

    import('leaflet').then(mod => {
      if (!mounted || !mapRef.current || mapObj.current) return
      const L = mod.default

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { scrollWheelZoom: false, zoomControl: true })
        .setView(center, zoomInitial)
      mapObj.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const mkIcon = (color: string) => L.divIcon({
        className: '',
        iconAnchor:  [16, 38],
        popupAnchor: [0, -38],
        html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 9 16 24 16 24s16-15 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="7" fill="white"/></svg>`,
      })

      residences.forEach(r => {
        const m = L.marker([r.lat, r.lng], { icon: mkIcon(residenceMarkerColor) }).addTo(map)
        m.bindPopup(`
          <div style="font-family:system-ui;min-width:190px;padding:4px">
            <img src="${r.img}" style="width:100%;height:88px;object-fit:cover;border-radius:8px;margin-bottom:9px"/>
            <div style="font-weight:800;font-size:14px;margin-bottom:2px">${r.name}</div>
            <div style="font-size:12px;color:#7A6550;margin-bottom:8px">${r.loc}, ${villeSuffix}</div>
            <div style="font-weight:900;font-size:16px;color:#E07A2F;margin-bottom:9px">${r.price} ${prixSuffix}</div>
            <button id="res-${r.pr}" style="background:#E07A2F;color:#fff;border:none;border-radius:7px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer;width:100%">
              ${reserverLabel}
            </button>
          </div>
        `, { maxWidth: 220 })
        m.on('popupopen', () => {
          setTimeout(() => {
            document.getElementById(`res-${r.pr}`)?.addEventListener('click', () => {
              onReserve?.(r.name, `${r.loc}, ${villeSuffix}`, r.pr, r.img)
              map.closePopup()
            })
          }, 100)
        })
      })
    })

    return () => { mounted = false }
  }, [center, onReserve, prixSuffix, residenceMarkerColor, residences, reserverLabel, villeSuffix, zoomInitial])

  const geolocate = () => {
    if (!navigator.geolocation || !mapObj.current) return
    setLocBtn('loading')
    import('leaflet').then(mod => {
      const L = mod.default
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords
          const map = mapObj.current!
          L.marker([lat, lng], {
            icon: L.divIcon({
              className: '',
              iconAnchor: [16, 38],
              html: `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 9 16 24 16 24s16-15 16-24C32 7.163 24.837 0 16 0z" fill="${userMarkerColor}"/><circle cx="16" cy="16" r="7" fill="white"/></svg>`,
            }),
          }).addTo(map).bindPopup(`<strong>${positionPopup}</strong>`).openPopup()
          L.circle([lat, lng], { radius: 300, color: userMarkerColor, fillColor: userMarkerColor, fillOpacity: 0.1, weight: 2 }).addTo(map)
          map.flyTo([lat, lng], zoomPosition, { duration: 1.5 })

          if (residences.length) {
            const nearest = residences
              .map(r => ({ name: r.name, d: Math.sqrt((r.lat - lat) ** 2 + (r.lng - lng) ** 2) * 111000 }))
              .sort((a, b) => a.d - b.d)[0]
            setNear(`${nearest.name} — ${nearest.d < 1000 ? Math.round(nearest.d) + 'm' : (nearest.d / 1000).toFixed(1) + 'km'}`)
          }
          setLocBtn('done')
        },
        () => { alert(erreurGps); setLocBtn('idle') },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  if (config?.actif === false) return null

  return (
    <section className="py-20" style={{ background: '#F3EFE9' }} id={sectionId}>
      <div className="max-w-[1240px] mx-auto px-10">
        <div className="mb-1 text-[11px] font-bold tracking-[2px] uppercase" style={{ color: '#E07A2F' }}>
          {surtitre}
        </div>
        <h2 className="text-[32px] font-black text-[#1A0E06] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          {titre}
        </h2>
        <p className="text-[#7A6550] mb-5">{sousTitre}</p>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <button
            onClick={geolocate}
            disabled={locBtn === 'loading'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
            style={{ background: locBtn === 'done' ? '#16A34A' : '#0369A1', fontFamily: 'var(--font-heading)', opacity: locBtn === 'loading' ? .7 : 1 }}
          >
            <Crosshair size={15} />
            {locBtn === 'loading' ? boutonGpsLoading : locBtn === 'done' ? boutonGpsDone : boutonGpsIdle}
          </button>
          <button
            onClick={() => mapObj.current?.flyTo(center, zoomInitial, { duration: 1 })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all"
            style={{ background: '#fff', border: '1.5px solid #E5DDD4', color: '#1A0E06', fontFamily: 'var(--font-heading)' }}
          >
            <RotateCcw size={15} />
            {boutonCentrer}
          </button>
          {near && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[12px] font-bold"
              style={{ background: '#DBEAFE', color: '#0369A1', border: '1px solid #93C5FD' }}>
              {plusProcheLabel} : {near}
            </span>
          )}
        </div>

        {/* Map container */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="anonymous" />
        <div
          ref={mapRef}
          className="w-full rounded-2xl overflow-hidden"
          style={{ height: '460px', border: '1px solid #E5DDD4', boxShadow: '0 8px 32px rgba(26,14,6,.11)' }}
        />

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 flex-wrap">
          <div className="flex items-center gap-2 text-[13px] text-[#7A6550]">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: residenceMarkerColor }} />
            {legendResidencesLabel}
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#7A6550]">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: userMarkerColor }} />
            {legendUserLabel}
          </div>
          <div className="ml-auto text-[12px] text-[#7A6550]">{attributionLabel}</div>
        </div>
      </div>
    </section>
  )
}

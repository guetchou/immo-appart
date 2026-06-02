'use client'

import { ExternalLink, Play } from 'lucide-react'
import { FaTiktok, FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa'

type Publication = {
  id: number
  documentId: string
  reseau: 'tiktok' | 'instagram' | 'youtube' | 'facebook'
  titre: string
  description?: string
  url_post: string
  miniature_url?: string
  miniature?: { url: string; alternativeText?: string }
  vues?: number
  date_publication?: string
  actif: boolean
}

type Props = {
  publications: Publication[]
  titre?: string
  sousTitre?: string
  reseaux?: {
    tiktok_url?: string
    tiktok_actif?: boolean
    instagram_url?: string
    instagram_actif?: boolean
    youtube_url?: string
    youtube_actif?: boolean
    facebook_url?: string
    facebook_actif?: boolean
    whatsapp_numero?: string
    whatsapp_actif?: boolean
  }
}

const RESEAU_CONFIG = {
  tiktok:    { Icon: FaTiktok,    label: 'TikTok',    color: '#1A0E06', bg: '#F3EFE9' },
  instagram: { Icon: FaInstagram, label: 'Instagram',  color: '#E07A2F', bg: '#FEF0E6' },
  youtube:   { Icon: FaYoutube,   label: 'YouTube',    color: '#DC2626', bg: '#FEF2F2' },
  facebook:  { Icon: FaFacebook,  label: 'Facebook',   color: '#0369A1', bg: '#DBEAFE' },
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'

function imgUrl(pub: Publication) {
  if (pub.miniature?.url) {
    const u = pub.miniature.url
    return u.startsWith('http') ? u : `${STRAPI_URL}${u}`
  }
  return pub.miniature_url ?? null
}

export default function SocialWall({ publications, titre, sousTitre, reseaux }: Props) {
  if (!publications.length && !reseaux) return null

  const socials = [
    { key: 'tiktok',    url: reseaux?.tiktok_url,    actif: reseaux?.tiktok_actif,    ...RESEAU_CONFIG.tiktok    },
    { key: 'instagram', url: reseaux?.instagram_url, actif: reseaux?.instagram_actif, ...RESEAU_CONFIG.instagram },
    { key: 'youtube',   url: reseaux?.youtube_url,   actif: reseaux?.youtube_actif,   ...RESEAU_CONFIG.youtube   },
    { key: 'facebook',  url: reseaux?.facebook_url,  actif: reseaux?.facebook_actif,  ...RESEAU_CONFIG.facebook  },
  ].filter(s => s.actif && s.url)

  return (
    <section className="py-20" style={{ background: '#fff' }} id="social">
      <div className="max-w-[1240px] mx-auto px-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-[2px] uppercase mb-2 text-[#7A6550]">
              Réseaux sociaux
            </div>
            <h2 className="font-black text-[#1A0E06] mb-1" style={{ fontSize: '30px', fontFamily: 'var(--font-heading)' }}>
              {titre ?? 'Suivez-nous'}
            </h2>
            {sousTitre && <p className="text-[#7A6550] text-[15px]">{sousTitre}</p>}
            <div className="w-10 h-[3px] rounded-full mt-2" style={{ background: '#E07A2F' }} />
          </div>

          {/* Boutons réseaux */}
          {socials.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {socials.map(s => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all"
                  style={{ background: s.bg, color: s.color, border: `1.5px solid ${s.bg}`, fontFamily: 'var(--font-heading)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = s.color }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = s.bg }}
                >
                  <s.Icon size={15} />
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Grille de publications */}
        {publications.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {publications.map(pub => {
              const cfg = RESEAU_CONFIG[pub.reseau]
              const thumb = imgUrl(pub)
              return (
                <a
                  key={pub.id}
                  href={pub.url_post}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-2xl overflow-hidden bg-[#F3EFE9] aspect-square block transition-all"
                  style={{ boxShadow: '0 2px 8px rgba(26,14,6,.07)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,14,6,.16)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,14,6,.07)' }}
                >
                  {/* Miniature */}
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt={pub.titre}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(26,14,6,.55)' }}>
                    <div className="text-center px-4">
                      <Play size={32} className="text-white mx-auto mb-2" />
                      <p className="text-white font-semibold text-[13px] line-clamp-2">{pub.titre}</p>
                    </div>
                  </div>

                  {/* Badge réseau */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: cfg.bg }}>
                    <cfg.Icon size={15} color={cfg.color} />
                  </div>

                  {/* Vues */}
                  {pub.vues && (
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[11px] font-bold text-white"
                      style={{ background: 'rgba(26,14,6,.7)' }}>
                      {pub.vues >= 1000 ? `${(pub.vues / 1000).toFixed(0)}k` : pub.vues}
                    </div>
                  )}

                  {/* Lien externe */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,.9)' }}>
                    <ExternalLink size={12} color="#1A0E06" />
                  </div>
                </a>
              )
            })}
          </div>
        ) : (
          /* État vide — invitation à suivre */
          <div className="text-center py-14 rounded-2xl" style={{ background: '#F3EFE9', border: '1px solid #E5DDD4' }}>
            <div className="flex justify-center gap-4 mb-4">
              {Object.entries(RESEAU_CONFIG).map(([key, cfg]) => (
                <div key={key} className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: cfg.bg }}>
                  <cfg.Icon size={20} color={cfg.color} />
                </div>
              ))}
            </div>
            <p className="font-bold text-[#1A0E06] text-[16px] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Retrouvez-nous sur les réseaux
            </p>
            <p className="text-[#7A6550] text-[14px] mb-5">
              Ajoutez vos publications depuis le panneau Strapi
            </p>
            {socials.map(s => (
              <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold mr-2 mb-2"
                style={{ background: s.bg, color: s.color, fontFamily: 'var(--font-heading)' }}>
                <s.Icon size={14} />{s.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

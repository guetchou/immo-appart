'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'

type FooterLink    = { label: string; href: string }
type FooterColonne = { titre: string; liens: FooterLink[] }

const DEFAULT_COLONNES: FooterColonne[] = [
  { titre: 'Appartements', liens: [
    { label: 'Studios',        href: '/appartements' },
    { label: 'T2 & T3',        href: '/appartements' },
    { label: 'Penthouse',      href: '/appartements' },
    { label: 'Villas',         href: '/appartements' },
    { label: 'Lofts & Duplex', href: '/appartements' },
  ]},
  { titre: 'Services', liens: [
    { label: 'Navette aéroport', href: '/#services' },
    { label: 'Chef cuisinier',   href: '/#services' },
    { label: 'Conciergerie',     href: '/#services' },
    { label: 'Sécurité 24h',     href: '/#services' },
    { label: 'Ménage quotidien', href: '/#services' },
  ]},
  { titre: 'Informations', liens: [
    { label: 'À propos',               href: '/a-propos'  },
    { label: "Politique d'annulation", href: '/annulation' },
    { label: 'Règlement intérieur',    href: '/reglement'  },
    { label: 'Modes de paiement',      href: '/paiement'   },
    { label: 'Contact',                href: '/#contact'   },
  ]},
]

type FooterProps = {
  logoNom?:       string
  logoTagline?:   string
  description?:   string
  adresse?:       string
  email?:         string
  telephone?:     string
  copyright?:     string
  facebookUrl?:   string
  instagramUrl?:  string
  youtubeUrl?:    string
  whatsappUrl?:   string
  tiktokUrl?:     string
  colonnesLiens?: FooterColonne[]
}

export default function Footer({
  logoNom     = 'Résidence NDOMBI',
  logoTagline = 'Confort · Luxe · Élégance',
  description = "Appartements meublés haut de gamme pour séjours courts et longs à Pointe-Noire. Une expérience unique alliant confort, luxe et service personnalisé.",
  adresse     = 'Foucks, Pointe-Noire — près de la Clinique MOUAMBA, République du Congo',
  email       = 'residencendombi@gmail.com',
  telephone   = '+242 06 435 90 90',
  copyright   = 'Résidence NDOMBI — Tous droits réservés',
  facebookUrl,  instagramUrl,
  youtubeUrl,   whatsappUrl  = 'https://wa.me/242064359090',
  tiktokUrl   = 'https://www.tiktok.com/@rsidence.ndombi',
  colonnesLiens,
}: FooterProps = {}) {
  const colonnes = colonnesLiens?.length ? colonnesLiens : DEFAULT_COLONNES

  return (
    <footer id="contact" style={{ background: '#1A0E06' }}>
      <div className="max-w-[1240px] mx-auto px-8 pt-16 pb-8">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand col */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-[46px] h-[46px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '2px solid #E07A2F' }}
              >
                <span className="font-serif text-[17px] font-bold text-white">RN</span>
              </div>
              <div>
                <div className="font-black text-[15px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                  {logoNom}
                </div>
                <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[#E07A2F]">
                  {logoTagline}
                </div>
              </div>
            </div>

            <p className="text-[14px] leading-[1.8] mb-5" style={{ color: 'rgba(255,255,255,.45)' }}>
              {description}
            </p>

            <div className="space-y-2.5">
              {[
                { icon: <Phone size={14} />,  text: telephone, href: `tel:${telephone.replace(/\s/g,'')}` },
                { icon: <Mail size={14} />,   text: email,     href: `mailto:${email}` },
                { icon: <MapPin size={14} />, text: adresse,   href: '/#localisation'  },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-start gap-3 text-[13px] transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,.65)' }}
                >
                  <span className="mt-0.5 flex-shrink-0 text-[#E07A2F]">{item.icon}</span>
                  {item.text}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns from Strapi */}
          {colonnes.map(col => (
            <div key={col.titre}>
              <h5
                className="text-[11px] font-bold tracking-[1.8px] uppercase mb-5"
                style={{ color: '#E07A2F' }}
              >
                {col.titre}
              </h5>
              <ul className="space-y-2.5">
                {col.liens.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] transition-colors duration-200"
                      style={{ color: 'rgba(255,255,255,.5)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#E07A2F')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7"
          style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}
        >
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,.3)' }}>
            © {new Date().getFullYear()} {copyright}
          </span>
          <div className="flex items-center gap-3">
            {[
              { icon: <FaFacebook size={14} />,  label: 'Facebook',  href: facebookUrl  },
              { icon: <FaInstagram size={14} />, label: 'Instagram', href: instagramUrl },
              { icon: <FaYoutube size={14} />,   label: 'YouTube',   href: youtubeUrl   },
              { icon: <FaWhatsapp size={14} />,  label: 'WhatsApp',  href: whatsappUrl  },
            ].filter(s => s.href).map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.5)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background  = '#E07A2F'
                  e.currentTarget.style.borderColor = '#E07A2F'
                  e.currentTarget.style.color       = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background  = 'rgba(255,255,255,.06)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                  e.currentTarget.style.color       = 'rgba(255,255,255,.5)'
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

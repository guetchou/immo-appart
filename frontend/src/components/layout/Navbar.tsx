'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Phone, User, LogOut, Calendar, Heart, ChevronDown, Menu, X } from 'lucide-react'

const DEFAULT_navLinks = [
  { label: 'Accueil',       href: '/'              },
  { label: 'Appartements',  href: '/appartements'  },
  { label: 'Services',      href: '/#services'     },
  { label: 'Avis',          href: '/#temoignages'  },
  { label: 'Contact',       href: '/#contact'      },
]

type NavLink = { label: string; href: string }

export type NavProps = {
  logoNom?:          string
  logoTagline?:      string
  logoImageUrl?:     string
  telephone?:        string
  agentNom?:         string
  agentPhotoUrl?:    string
  liensNav?:         NavLink[]
  boutonReserver?:   string
}

export default function Navbar({
  logoNom        = 'Résidence NDOMBI',
  logoTagline    = 'Confort · Luxe · Élégance',
  logoImageUrl,
  telephone      = '+242 06 435 90 90',
  agentNom       = 'Agent NDOMBI',
  agentPhotoUrl  = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
  liensNav,
  boutonReserver = 'Réserver',
}: NavProps = {}) {
  const navLinks = liensNav?.length ? liensNav : DEFAULT_navLinks
  const router = useRouter()
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [userOpen,    setUserOpen]    = useState(false)
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [userName,    setUserName]    = useState('')

  useEffect(() => {
    // Lire la session depuis sessionStorage
    try {
      const stored = sessionStorage.getItem('ndombi_user')
      if (stored) {
        const u = JSON.parse(stored)
        setIsLoggedIn(true)
        setUserName(u.username || u.email?.split('@')[0] || 'Compte')
      }
    } catch { /* ignore */ }
  }, [])

  const handleLogout = async () => {
    sessionStorage.removeItem('ndombi_user')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setIsLoggedIn(false); setUserName(''); setUserOpen(false)
    router.push('/')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 h-[68px] transition-shadow duration-300"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5DDD4',
        boxShadow: scrolled ? '0 4px 24px rgba(26,14,6,.10)' : 'none',
      }}
    >
      <div className="max-w-[1240px] mx-auto h-full px-6 flex items-center gap-6">

        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div
            className="w-[42px] h-[42px] rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: '#1A0E06', border: '2px solid #E07A2F' }}
          >
            {logoImageUrl
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoImageUrl} alt={logoNom} className="w-full h-full object-cover" />
              : <span className="font-serif text-[15px] font-bold text-white">RN</span>
            }
          </div>
          <div className="hidden sm:block leading-none">
            <div className="font-black text-[14px] text-[#1A0E06]" style={{ fontFamily: 'var(--font-heading)' }}>
              {logoNom}
            </div>
            <div className="text-[10px] font-semibold tracking-[1.8px] uppercase text-[#E07A2F]">
              {logoTagline}
            </div>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <nav className="hidden lg:flex items-center gap-7 ml-auto">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[14px] font-medium text-[#7A6550] hover:text-[#E07A2F] transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Bouton Réserver ── */}
        <Link
          href="/appartements"
          className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black text-white transition-all flex-shrink-0"
          style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
          onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}
        >
          {boutonReserver}
        </Link>

        {/* ── Agent CTA ── */}
        <a
          href={`tel:${telephone.replace(/\s/g,'')}`}
          className="hidden md:flex items-center gap-3 rounded-full px-3 py-[5px] pr-5 transition-all duration-200"
          style={{ background: '#FBF8F4', border: '1px solid #E5DDD4' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#E07A2F'
            e.currentTarget.style.boxShadow   = '0 4px 18px rgba(224,122,47,.22)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#E5DDD4'
            e.currentTarget.style.boxShadow   = 'none'
          }}
        >
          {/* Photo agent avec indicateur en ligne */}
          <div className="relative flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={agentPhotoUrl}
              alt={agentNom}
              className="w-11 h-11 rounded-full object-cover"
              style={{ border: '2.5px solid #E07A2F' }}
            />
            {/* Point vert "en ligne" avec pulse */}
            <span className="nav-agent-pulse absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: '#22C55E' }} />
          </div>
          <div className="leading-none">
            <div className="text-[11px] text-[#7A6550] font-medium mb-0.5">Appelez notre agent</div>
            <div className="text-[13px] font-black text-[#1A0E06] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              {telephone}
            </div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#22C55E' }}>
              En ligne · Répond en 5 min
            </div>
          </div>
        </a>

        {/* ── Auth ── */}
        <div className="relative hidden md:block">
          {!isLoggedIn ? (
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-4 py-[9px] rounded-lg text-[13px] font-bold transition-all duration-200"
              style={{ background: '#E07A2F', color: '#fff', fontFamily: 'var(--font-heading)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#B85E18' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#E07A2F' }}
            >
              <User size={15} />
              Se connecter
            </button>
          ) : (
            <>
              <button
                onClick={() => setUserOpen(v => !v)}
                className="flex items-center gap-2 rounded-full px-3 py-[5px] pr-4 transition-all"
                style={{ background: '#FBF8F4', border: '1.5px solid #E07A2F' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] text-white flex-shrink-0"
                  style={{ background: '#E07A2F' }}>
                  {userName[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-[13px] font-bold text-[#1A0E06] max-w-[80px] truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                  {userName}
                </span>
                <ChevronDown size={13} className="text-[#7A6550]" />
              </button>

              {userOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-52 rounded-xl overflow-hidden z-50"
                  style={{ background: '#fff', border: '1px solid #E5DDD4', boxShadow: '0 24px 60px rgba(26,14,6,.16)' }}
                >
                  <div className="px-4 py-3 border-b border-[#E5DDD4]">
                    <div className="font-bold text-[14px] text-[#1A0E06] truncate">{userName}</div>
                  </div>
                  {[
                    { icon: <User size={15} />,     label: 'Mon espace',      href: '/mon-espace'          },
                    { icon: <Calendar size={15} />, label: 'Mes réservations', href: '/mon-espace'          },
                    { icon: <Heart size={15} />,    label: 'Mes favoris',      href: '/mon-espace'          },
                  ].map(item => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 text-[14px] text-[#1C110A] hover:bg-[#FBF8F4] transition-colors"
                      onClick={() => setUserOpen(false)}
                    >
                      <span className="text-[#7A6550]">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div className="h-px bg-[#E5DDD4] mx-4" />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    Se déconnecter
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Mobile menu button ── */}
        <button
          className="lg:hidden ml-auto p-2 rounded-lg hover:bg-[#FBF8F4] transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile nav drawer ── */}
      {menuOpen && (
        <div
          className="lg:hidden absolute inset-x-0 top-[68px] py-4 px-6 space-y-1"
          style={{ background: '#fff', borderBottom: '1px solid #E5DDD4', boxShadow: '0 8px 32px rgba(26,14,6,.12)' }}
        >
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-3 px-4 rounded-lg text-[15px] font-medium text-[#1C110A] hover:bg-[#FEF0E6] hover:text-[#E07A2F] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="tel:+242064359090"
            className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-[#FEF0E6] transition-colors"
          >
            <Phone size={16} className="text-[#E07A2F]" />
            <span className="text-[15px] font-bold text-[#1A0E06]">{telephone}</span>
          </a>
        </div>
      )}
    </header>
  )
}

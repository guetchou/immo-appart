'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar  from '@/components/layout/Navbar'
import type { NavProps } from '@/components/layout/Navbar'
import Footer  from '@/components/layout/Footer'
import {
  Calendar, MapPin, Clock, CheckCircle2, AlertCircle,
  XCircle, Heart, User, LogOut, ChevronRight, Home,
} from 'lucide-react'
import { toStrapiPublicUrl } from '@/lib/strapi-url'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'

type Resa = {
  id: number; documentId: string; reference: string
  statut: string; date_arrivee: string; date_depart: string
  nombre_nuits: number; prix_total: number; mode_paiement: string
  prenom_client: string; nom_client: string
  appartement?: { titre: string; slug: string; quartier: string; image_principale?: { url: string } }
}

type FavApt = {
  documentId: string; titre: string; slug: string
  quartier: string; ville: string; prix_nuit_base: number
  image_principale?: { url: string }
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; Icon: React.ComponentType<{size?:number}> }> = {
  en_attente:    { label: 'En attente',    color:'#CA8A04', bg:'#FEF9E6', border:'#FDE68A', Icon: Clock         },
  confirmee:     { label: 'Confirmée',     color:'#16A34A', bg:'#DCFCE7', border:'#86EFAC', Icon: CheckCircle2  },
  acompte_verse: { label: 'Acompte versé', color:'#0369A1', bg:'#DBEAFE', border:'#93C5FD', Icon: CheckCircle2  },
  soldee:        { label: 'Soldée',        color:'#7C3AED', bg:'#F3E8FF', border:'#C4B5FD', Icon: CheckCircle2  },
  annulee:       { label: 'Annulée',       color:'#B91C1C', bg:'#FEE2E2', border:'#FCA5A5', Icon: XCircle       },
  no_show:       { label: 'No-show',       color:'#6B7280', bg:'#F3F4F6', border:'#E5E7EB', Icon: AlertCircle   },
}

const TABS = ['Mes réservations', 'Mes favoris', 'Mon profil'] as const
type Tab = typeof TABS[number]

export default function MonEspaceClient({ navProps }: { navProps?: NavProps }) {
  const router  = useRouter()
  const [tab,   setTab]   = useState<Tab>('Mes réservations')
  const [user,  setUser]  = useState<{ username?: string; email?: string } | null>(null)
  const [resas, setResas] = useState<Resa[]>([])
  const [favs,  setFavs]  = useState<FavApt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger profil depuis sessionStorage
    try {
      const stored = sessionStorage.getItem('ndombi_user')
      if (stored) {
        const u = JSON.parse(stored)
        setUser(u)
        fetchResas(u.email)
      } else {
        setLoading(false)
      }
    } catch { setLoading(false) }

    // Charger favoris depuis localStorage
    loadFavs()
  }, [])

  async function fetchResas(email: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/mes-reservations?email=${encodeURIComponent(email)}`)
      const { data } = await res.json()
      setResas(data ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  function loadFavs() {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('ndombi_favs') ?? '[]')
      if (!ids.length) return
      // Récupérer les détails des appartements favoris
      const params = ids.map(id => `filters[documentId][$in][]=${id}`).join('&')
      fetch(`${STRAPI_URL}/api/appartements?${params}&populate=image_principale&fields[0]=titre&fields[1]=slug&fields[2]=quartier&fields[3]=ville&fields[4]=prix_nuit_base`)
        .then(r => r.json())
        .then(d => setFavs(d.data ?? []))
        .catch(() => {})
    } catch { /* ignore */ }
  }

  function removeFav(documentId: string) {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem('ndombi_favs') ?? '[]')
      const next = ids.filter(id => id !== documentId)
      localStorage.setItem('ndombi_favs', JSON.stringify(next))
      setFavs(prev => prev.filter(a => a.documentId !== documentId))
    } catch { /* ignore */ }
  }

  async function logout() {
    sessionStorage.removeItem('ndombi_user')
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    document.cookie = 'ndombi_jwt=; Max-Age=0; path=/'
    router.push('/')
  }

  const fmtDate = (d: string) =>
    d ? new Date(d+'T12:00').toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : '—'

  function imgUrl(url?: string) {
    if (!url) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=140&fit=crop'
    return toStrapiPublicUrl(url) ?? url
  }

  return (
    <>
      <Navbar {...navProps} />
      <main className="pt-[68px] min-h-screen" style={{ background:'#FBF8F4' }}>

        {/* ── Header dashboard ── */}
        <div className="py-10 px-8" style={{ background:'#1A0E06' }}>
          <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-[20px] text-white flex-shrink-0"
                style={{ background:'#E07A2F', border:'3px solid rgba(255,255,255,.2)' }}>
                {user?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <div className="font-black text-white text-[18px]" style={{ fontFamily:'var(--font-heading)' }}>
                  Bonjour, {user?.username ?? 'Visiteur'}
                </div>
                <div className="text-[13px]" style={{ color:'rgba(255,255,255,.55)' }}>{user?.email ?? ''}</div>
              </div>
            </div>
            <button onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all"
              style={{ border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.7)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; e.currentTarget.style.color='#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.2)'; e.currentTarget.style.color='rgba(255,255,255,.7)' }}>
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
        </div>

        {/* ── Stats rapides ── */}
        <div className="max-w-[1000px] mx-auto px-8 -mt-4 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label:'Réservations', value: resas.length, color:'#E07A2F' },
              { label:'Confirmées',   value: resas.filter(r=>r.statut==='confirmee'||r.statut==='soldee').length, color:'#16A34A' },
              { label:'Favoris',      value: favs.length, color:'#0369A1' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4 text-center"
                style={{ border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.06)' }}>
                <div className="font-black text-[28px]" style={{ color:s.color, fontFamily:'var(--font-heading)' }}>{s.value}</div>
                <div className="text-[12px] text-[#7A6550] font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="max-w-[1000px] mx-auto px-8">
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1" style={{ border:'1px solid #E5DDD4' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all"
                style={{ background:tab===t?'#E07A2F':'transparent', color:tab===t?'#fff':'#7A6550', fontFamily:'var(--font-heading)' }}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Réservations ── */}
          {tab === 'Mes réservations' && (
            <div className="space-y-4 pb-12">
              {loading && (
                <div className="text-center py-12 text-[#7A6550]">Chargement…</div>
              )}
              {!loading && resas.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl" style={{ border:'1px solid #E5DDD4' }}>
                  <Calendar size={40} className="mx-auto mb-4" style={{ color:'#E5DDD4' }} />
                  <p className="font-bold text-[#1A0E06] text-[16px] mb-1" style={{ fontFamily:'var(--font-heading)' }}>Aucune réservation</p>
                  <p className="text-[#7A6550] text-[14px] mb-5">Vos réservations apparaîtront ici.</p>
                  <Link href="/appartements"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-[13px]"
                    style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}>
                    <Home size={14} /> Voir les appartements
                  </Link>
                </div>
              )}
              {resas.map(r => {
                const cfg = STATUT_CONFIG[r.statut] ?? STATUT_CONFIG.en_attente
                const Icon = cfg.Icon
                return (
                  <div key={r.documentId} className="bg-white rounded-2xl overflow-hidden"
                    style={{ border:'1px solid #E5DDD4', boxShadow:'0 2px 8px rgba(26,14,6,.06)' }}>
                    <div className="flex items-stretch">
                      {/* Image */}
                      <div className="w-[120px] flex-shrink-0 hidden sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl(r.appartement?.image_principale?.url)}
                          alt={r.appartement?.titre ?? ''}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Content */}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="font-black text-[15px] text-[#1A0E06] mb-0.5" style={{ fontFamily:'var(--font-heading)' }}>
                              {r.appartement?.titre ?? 'Appartement'}
                            </div>
                            {r.appartement?.quartier && (
                              <div className="flex items-center gap-1 text-[12px] text-[#7A6550]">
                                <MapPin size={11} /> {r.appartement.quartier}, Pointe-Noire
                              </div>
                            )}
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0"
                            style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                          {[
                            { label:'Arrivée',  val: fmtDate(r.date_arrivee) },
                            { label:'Départ',   val: fmtDate(r.date_depart)  },
                            { label:'Durée',    val: `${r.nombre_nuits} nuit${r.nombre_nuits>1?'s':''}` },
                            { label:'Total',    val: `${r.prix_total.toLocaleString('fr-FR')} XAF` },
                          ].map(i => (
                            <div key={i.label}>
                              <div className="text-[10px] text-[#7A6550] uppercase tracking-wide font-semibold">{i.label}</div>
                              <div className="text-[13px] font-bold text-[#1A0E06]">{i.val}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#7A6550]">Réf. {r.reference}</span>
                          {r.appartement?.slug && (
                            <Link href={`/appartements/${r.appartement.slug}`}
                              className="flex items-center gap-1 text-[12px] font-bold transition-colors"
                              style={{ color:'#E07A2F' }}>
                              Voir l&apos;appartement <ChevronRight size={13} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Favoris ── */}
          {tab === 'Mes favoris' && (
            <div className="pb-12">
              {favs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl" style={{ border:'1px solid #E5DDD4' }}>
                  <Heart size={40} className="mx-auto mb-4" style={{ color:'#E5DDD4' }} />
                  <p className="font-bold text-[#1A0E06] text-[16px] mb-1" style={{ fontFamily:'var(--font-heading)' }}>Aucun favori</p>
                  <p className="text-[#7A6550] text-[14px] mb-5">Cliquez sur le cœur d&apos;une résidence pour la sauvegarder.</p>
                  <Link href="/appartements"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-[13px]"
                    style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}>
                    Explorer les résidences
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {favs.map(a => (
                    <div key={a.documentId} className="bg-white rounded-2xl overflow-hidden"
                      style={{ border:'1px solid #E5DDD4' }}>
                      <div className="relative h-[160px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl(a.image_principale?.url)} alt={a.titre}
                          className="w-full h-full object-cover" />
                        <button onClick={() => removeFav(a.documentId)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background:'rgba(255,255,255,.9)' }}>
                          <Heart size={13} fill="#E07A2F" stroke="#E07A2F" />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="font-black text-[14px] text-[#1A0E06] mb-0.5 truncate" style={{ fontFamily:'var(--font-heading)' }}>
                          {a.titre}
                        </div>
                        <div className="flex items-center gap-1 text-[12px] text-[#7A6550] mb-3">
                          <MapPin size={11} /> {a.quartier}, {a.ville}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[15px]" style={{ color:'#E07A2F', fontFamily:'var(--font-heading)' }}>
                            {a.prix_nuit_base.toLocaleString('fr-FR')} XAF
                          </span>
                          <Link href={`/appartements/${a.slug}`}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
                            style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}>
                            Voir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Profil ── */}
          {tab === 'Mon profil' && (
            <div className="pb-12">
              <div className="bg-white rounded-2xl p-7" style={{ border:'1px solid #E5DDD4' }}>
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom:'1px solid #E5DDD4' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-[24px] text-white"
                    style={{ background:'#E07A2F' }}>
                    {user?.username?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div>
                    <div className="font-black text-[18px] text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>
                      {user?.username ?? '—'}
                    </div>
                    <div className="text-[13px] text-[#7A6550]">{user?.email ?? '—'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label:'Nom d\'utilisateur', val: user?.username ?? '—', Icon: User },
                    { label:'Adresse email',       val: user?.email ?? '—',    Icon: User },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background:'#FBF8F4', border:'1px solid #E5DDD4' }}>
                      <f.Icon size={15} style={{ color:'#7A6550' }} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-[#7A6550] uppercase tracking-wide">{f.label}</div>
                        <div className="text-[13px] font-semibold text-[#1A0E06] truncate">{f.val}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#7A6550] mt-4">
                  Pour modifier votre profil, contactez-nous sur WhatsApp.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

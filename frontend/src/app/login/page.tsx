'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, Phone } from 'lucide-react'
import { FaGoogle, FaFacebook } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ identifier: email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Identifiants incorrects.'); return }

      // Stocker le profil en sessionStorage pour l'affichage
      if (data.user) sessionStorage.setItem('ndombi_user', JSON.stringify(data.user))
      router.push('/')
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Côté gauche — Photo luxury ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: '#1A0E06' }}>
        {/* Photo fond */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1200&fit=crop"
          alt="Résidence NDOMBI"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(26,14,6,.85) 0%, rgba(224,122,47,.3) 100%)' }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ border: '2px solid #E07A2F', background: 'rgba(26,14,6,.6)' }}>
            <span className="font-serif text-[14px] font-bold text-white">RN</span>
          </div>
          <div>
            <div className="font-black text-[14px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Résidence NDOMBI
            </div>
            <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#F09A55]">
              Confort · Luxe · Élégance
            </div>
          </div>
        </Link>

        {/* Accroche centrale */}
        <div className="relative z-10">
          <h2 className="font-black text-white mb-4"
            style={{ fontSize: 'clamp(28px,3vw,42px)', fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Votre espace<br />
            <span style={{ color: '#F09A55' }}>privilégié</span>
          </h2>
          <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7 }}>
            Gérez vos réservations, consultez vos séjours passés et accédez à vos offres personnalisées.
          </p>
          <div className="flex flex-col gap-3">
            {['Suivi de réservations en temps réel', 'Accès prioritaire aux nouvelles résidences', 'Offres exclusives membres'].map(f => (
              <div key={f} className="flex items-center gap-3 text-[14px]" style={{ color: 'rgba(255,255,255,.8)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#E07A2F' }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="relative z-10 flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,.5)' }}>
          <Phone size={13} style={{ color: '#E07A2F' }} />
          +242 06 435 90 90
        </div>
      </div>

      {/* ── Côté droit — Formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-white lg:px-16 xl:px-24">
        {/* Retour */}
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-medium mb-10 w-fit transition-colors hover:text-[#E07A2F]"
          style={{ color: '#7A6550' }}>
          <ArrowLeft size={15} /> Retour à l&apos;accueil
        </Link>

        {/* Titre */}
        <div className="mb-8">
          <h1 className="font-black text-[#1A0E06] mb-2"
            style={{ fontSize: 'clamp(28px,3vw,38px)', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>
            Bienvenue
          </h1>
          <p className="text-[#7A6550] text-[15px]">
            Connectez-vous à votre espace Résidence NDOMBI
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1A0E06] mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#7A6550' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                autoComplete="email"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] text-[#1C110A] placeholder:text-[#B8A898] outline-none transition-all"
                style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                onFocus={e  => (e.target.style.borderColor = '#E07A2F')}
                onBlur={e   => (e.target.style.borderColor = '#E5DDD4')}
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-semibold text-[#1A0E06]">
                Mot de passe
              </label>
              <Link href="/mot-de-passe-oublie" className="text-[12px] font-medium transition-colors hover:text-[#E07A2F]"
                style={{ color: '#7A6550' }}>
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#7A6550' }} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                className="w-full pl-11 pr-12 py-3.5 rounded-xl text-[14px] text-[#1C110A] outline-none transition-all"
                style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                onFocus={e  => (e.target.style.borderColor = '#E07A2F')}
                onBlur={e   => (e.target.style.borderColor = '#E5DDD4')}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:text-[#E07A2F]"
                style={{ color: '#7A6550' }} aria-label={showPwd ? 'Masquer' : 'Afficher'}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-[13px]"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Bouton connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white text-[15px] transition-all relative overflow-hidden"
            style={{ background: loading ? '#B8A898' : '#E07A2F', fontFamily: 'var(--font-heading)', cursor: loading ? 'not-allowed' : 'pointer' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B85E18' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#E07A2F' }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Connexion…</span>
              : 'Se connecter'
            }
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5DDD4]" />
            <span className="text-[12px] text-[#7A6550] font-medium">ou continuer avec</span>
            <div className="flex-1 h-px bg-[#E5DDD4]" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: FaGoogle,   label: 'Google',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
              { Icon: FaFacebook, label: 'Facebook',  color: '#0369A1', bg: '#DBEAFE', border: '#93C5FD' },
            ].map(s => (
              <button
                key={s.label}
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-bold transition-all"
                style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.color, fontFamily: 'var(--font-heading)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = s.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = s.border)}
              >
                <s.Icon size={16} /> {s.label}
              </button>
            ))}
          </div>

          {/* Lien inscription */}
          <p className="text-center text-[14px] text-[#7A6550]">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-bold transition-colors hover:text-[#B85E18]"
              style={{ color: '#E07A2F' }}>
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

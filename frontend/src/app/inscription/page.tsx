'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { FaGoogle, FaFacebook } from 'react-icons/fa'

type AuthEspaceConfig = Record<string, unknown>
const s = (config: AuthEspaceConfig | null, key: string, fallback: string) =>
  typeof config?.[key] === 'string' ? config[key] as string : fallback

export default function InscriptionPage() {
  const [config, setConfig] = useState<AuthEspaceConfig | null>(null)
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '', password: '', confirm: ''
  })
  const [showPwd,   setShowPwd]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [step,      setStep]      = useState<1|2>(1)

  useEffect(() => {
    fetch('/api/public-config/auth-espace')
      .then(res => res.ok ? res.json() : null)
      .then(json => setConfig(json?.data ?? null))
      .catch(() => {})
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:     form.email,
          password:  form.password,
          prenom:    form.prenom,
          nom:       form.nom,
          telephone: form.telephone,
          username:  form.email,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erreur lors de l\'inscription.'); return }
      if (data.user) sessionStorage.setItem('ndombi_user', JSON.stringify(data.user))
      setStep(2)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // ── Succès ────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF8F4] px-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full"
          style={{ boxShadow: '0 24px 60px rgba(26,14,6,.12)', border: '1px solid #E5DDD4' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: '#DCFCE7', border: '3px solid #16A34A' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="font-black text-[#1A0E06] text-[22px] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {s(config, 'inscription_success_titre', 'Compte créé !')}
          </h2>
          <p className="text-[#7A6550] text-[15px] mb-6">
            Bienvenue <strong>{form.prenom}</strong>. {s(config, 'inscription_success_texte', 'Votre compte a bien été créé.')}
          </p>
          <Link href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-xl font-black text-white text-[15px]"
            style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}>
            {s(config, 'inscription_success_cta', 'Se connecter maintenant')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Côté gauche — Photo ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{ background: '#1A0E06' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s(config, 'inscription_image_url', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=1200&fit=crop')}
          alt={s(config, 'marque_nom', 'Résidence NDOMBI')}
          className="absolute inset-0 w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(26,14,6,.88) 0%, rgba(224,122,47,.25) 100%)' }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-3 group w-fit">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ border: '2px solid #E07A2F', background: 'rgba(26,14,6,.6)' }}>
            <span className="font-serif text-[14px] font-bold text-white">{s(config, 'marque_initiales', 'RN')}</span>
          </div>
          <div>
            <div className="font-black text-[14px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              {s(config, 'marque_nom', 'Résidence NDOMBI')}
            </div>
            <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-[#F09A55]">
              {s(config, 'marque_tagline', 'Confort · Luxe · Élégance')}
            </div>
          </div>
        </Link>

        {/* Accroche */}
        <div className="relative z-10">
          <h2 className="font-black text-white mb-4"
            style={{ fontSize: 'clamp(28px,3vw,40px)', fontFamily: 'var(--font-heading)', letterSpacing: '-1px', lineHeight: 1.1 }}>
            {s(config, 'inscription_accroche_titre', 'Rejoignez')}<br />
            <span style={{ color: '#F09A55' }}>{s(config, 'inscription_accroche_accent', "l'expérience")}</span><br />
            {s(config, 'inscription_accroche_fin', 'NDOMBI')}
          </h2>
          <p className="text-[15px]" style={{ color: 'rgba(255,255,255,.65)', lineHeight: 1.7 }}>
            {s(config, 'inscription_accroche_texte', "Créez votre compte et profitez d'un accès prioritaire à nos résidences de luxe à Pointe-Noire.")}
          </p>
        </div>

        {/* Contact */}
        <div className="relative z-10 flex items-center gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,.5)' }}>
          <Phone size={13} style={{ color: '#E07A2F' }} />
          {s(config, 'telephone_contact', '+242 06 435 90 90')}
        </div>
      </div>

      {/* ── Côté droit — Formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-8 py-10 bg-white lg:px-14 xl:px-20 overflow-y-auto">
        <Link href="/login" className="inline-flex items-center gap-2 text-[13px] font-medium mb-8 w-fit transition-colors hover:text-[#E07A2F]"
          style={{ color: '#7A6550' }}>
          <ArrowLeft size={15} /> {s(config, 'inscription_retour_label', 'Déjà un compte ? Se connecter')}
        </Link>

        <div className="mb-6">
          <h1 className="font-black text-[#1A0E06] mb-2"
            style={{ fontSize: 'clamp(26px,3vw,36px)', fontFamily: 'var(--font-heading)', letterSpacing: '-1px' }}>
            {s(config, 'inscription_titre', 'Créer un compte')}
          </h1>
          <p className="text-[#7A6550] text-[14px]">
            {s(config, 'inscription_sous_titre', 'Tous les champs marqués * sont obligatoires')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Prénom / Nom */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'prenom', label: 'Prénom', placeholder: 'Jean', req: true },
              { key: 'nom',    label: 'Nom',    placeholder: 'Mbemba', req: true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[13px] font-semibold text-[#1A0E06] mb-1.5">
                  {f.label}{f.req && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7A6550' }} />
                  <input type="text" value={form[f.key as 'prenom'|'nom']} onChange={set(f.key as 'prenom'|'nom')}
                    placeholder={f.placeholder}
                    className="w-full pl-10 pr-3 py-3 rounded-xl text-[14px] text-[#1C110A] placeholder:text-[#B8A898] outline-none transition-all"
                    style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                    onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                    onBlur={e  => (e.target.style.borderColor = '#E5DDD4')} />
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1A0E06] mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7A6550' }} />
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="votre@email.com" autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-[#1C110A] placeholder:text-[#B8A898] outline-none transition-all"
                style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                onBlur={e  => (e.target.style.borderColor = '#E5DDD4')} />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1A0E06] mb-1.5">
              Téléphone
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7A6550' }} />
              <input type="tel" value={form.telephone} onChange={set('telephone')}
                placeholder="+242 06 000 00 00"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[14px] text-[#1C110A] placeholder:text-[#B8A898] outline-none transition-all"
                style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                onBlur={e  => (e.target.style.borderColor = '#E5DDD4')} />
            </div>
          </div>

          {/* Mot de passe / Confirmation */}
          {[
            { key: 'password', label: 'Mot de passe',    show: showPwd,  toggle: () => setShowPwd(v  => !v), placeholder: '••••••••••', hint: 'Minimum 8 caractères' },
            { key: 'confirm',  label: 'Confirmation',    show: showConf, toggle: () => setShowConf(v => !v), placeholder: '••••••••••', hint: '' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[13px] font-semibold text-[#1A0E06] mb-1.5">
                {f.label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7A6550' }} />
                <input type={f.show ? 'text' : 'password'}
                  value={form[f.key as 'password'|'confirm']} onChange={set(f.key as 'password'|'confirm')}
                  placeholder={f.placeholder}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-[14px] text-[#1C110A] outline-none transition-all"
                  style={{ border: '1.5px solid #E5DDD4', background: '#FBF8F4' }}
                  onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                  onBlur={e  => (e.target.style.borderColor = '#E5DDD4')} />
                <button type="button" onClick={f.toggle}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:text-[#E07A2F]"
                  style={{ color: '#7A6550' }}>
                  {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {f.hint && <p className="text-[11px] text-[#7A6550] mt-1">{f.hint}</p>}
            </div>
          ))}

          {/* Erreur */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-[13px]"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white text-[15px] transition-all"
            style={{ background: loading ? '#B8A898' : '#E07A2F', fontFamily: 'var(--font-heading)', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B85E18' }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#E07A2F' }}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {s(config, 'inscription_loading_label', 'Création…')}
              </span>
            ) : s(config, 'inscription_submit_label', 'Créer mon compte')}
          </button>

          {/* Social */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E5DDD4]" />
            <span className="text-[12px] text-[#7A6550]">{s(config, 'inscription_separator_label', "ou s'inscrire avec")}</span>
            <div className="flex-1 h-px bg-[#E5DDD4]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { Icon: FaGoogle,   label: 'Google',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
              { Icon: FaFacebook, label: 'Facebook',  color: '#0369A1', bg: '#DBEAFE', border: '#93C5FD' },
            ].map(s => (
              <button key={s.label} type="button"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all"
                style={{ background: s.bg, border: `1.5px solid ${s.border}`, color: s.color, fontFamily: 'var(--font-heading)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = s.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = s.border)}>
                <s.Icon size={15} /> {s.label}
              </button>
            ))}
          </div>

          <p className="text-center text-[13px] text-[#7A6550]">
            {s(config, 'inscription_have_account_label', 'Déjà un compte ?')}{' '}
            <Link href="/login" className="font-bold transition-colors hover:text-[#B85E18]" style={{ color: '#E07A2F' }}>
              {s(config, 'inscription_login_label', 'Se connecter')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

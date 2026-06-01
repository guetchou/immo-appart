'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, CheckCircle2, MessageCircle, Mail, Phone } from 'lucide-react'

type Apt = { name: string; loc: string; price: number; img: string }
type Step = 1 | 2 | 3 | 4

const PAY_OPTIONS = [
  { id: 'airtel_money', label: 'Airtel Money',  color: '#E07A2F', bg: '#FEF0E6' },
  { id: 'mtn_momo',     label: 'MTN MoMo',      color: '#CA8A04', bg: '#FEF9E6' },
  { id: 'espece',       label: 'Espèces',        color: '#16A34A', bg: '#DCFCE7' },
  { id: 'virement',     label: 'Virement',       color: '#0369A1', bg: '#DBEAFE' },
  { id: 'cheque',       label: 'Chèque',         color: '#7C3AED', bg: '#F3E8FF' },
]

const STEP_LABELS = ['Votre séjour', 'Vos informations', 'Paiement', 'Confirmation']

type Props = { apt: Apt | null; onClose: () => void }

export default function BookingModal({ apt, onClose }: Props) {
  const [step,     setStep]    = useState<Step>(1)
  const [nights,   setNights]  = useState(0)
  const [pay,      setPay]     = useState('')
  const [confirmed,setConfirm] = useState(false)
  const [ref,      setRef]     = useState('')

  // form fields
  const [arrivee,  setArrivee] = useState('')
  const [depart,   setDepart]  = useState('')
  const [pers,     setPers]    = useState('1 voyageur')
  const [prenom,   setPrenom]  = useState('')
  const [nom,      setNom]     = useState('')
  const [email,    setEmail]   = useState('')
  const [tel,      setTel]     = useState('')
  const [wapp,     setWapp]    = useState('')
  const [type,     setType]    = useState<'particulier' | 'professionnel'>('particulier')
  const [societe,  setSociete] = useState('')
  const [demandes, setDemandes]= useState('')

  useEffect(() => {
    if (arrivee && depart) {
      const n = Math.round((new Date(depart).getTime() - new Date(arrivee).getTime()) / 86400000)
      setNights(n > 0 ? n : 0)
    }
  }, [arrivee, depart])

  useEffect(() => {
    if (apt) { setStep(1); setConfirm(false); setRef(''); setPay('') }
  }, [apt])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = apt ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [apt])

  if (!apt) return null

  const total = nights * apt.price

  const next = () => {
    if (step === 1 && (!arrivee || !depart || nights <= 0)) {
      alert('Veuillez renseigner des dates valides.'); return
    }
    if (step === 2 && (!prenom || !nom || !email || !tel)) {
      alert('Veuillez remplir tous les champs obligatoires.'); return
    }
    if (step === 3 && !pay) {
      alert('Veuillez choisir un mode de paiement.'); return
    }
    if (step < 4) setStep(s => (s + 1) as Step)
  }

  const confirm = () => {
    setRef(`RES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`)
    setConfirm(true)
  }

  const fmtDate = (d: string) => d ? new Date(d + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,14,6,.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(26,14,6,.25)', animation: 'slideUp .22s ease' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-7 py-5"
          style={{ borderBottom: '1px solid #E5DDD4' }}>
          <div>
            <div className="font-black text-[17px] text-[#1A0E06]" style={{ fontFamily: 'var(--font-heading)' }}>
              Réserver {apt.name}
            </div>
            <div className="text-[12px] text-[#7A6550] mt-0.5">
              Étape {step} / 4 — {STEP_LABELS[step - 1]}
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#FBF8F4]"
            style={{ border: '1.5px solid #E5DDD4', color: '#7A6550' }}>
            <X size={16} />
          </button>
        </div>

        {/* Step bar */}
        <div className="flex items-center px-7 py-4 gap-1" style={{ borderBottom: '1px solid #E5DDD4' }}>
          {([1, 2, 3, 4] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-all"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: s < step ? '#16A34A' : s === step ? '#E07A2F' : '#fff',
                    color:      s < step || s === step ? '#fff' : '#7A6550',
                    border:     `2px solid ${s < step ? '#16A34A' : s === step ? '#E07A2F' : '#E5DDD4'}`,
                  }}
                >
                  {s < step ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: s === step ? '#E07A2F' : s < step ? '#16A34A' : '#7A6550' }}>
                  {STEP_LABELS[s - 1]}
                </span>
              </div>
              {i < 3 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 transition-all" style={{ background: s < step ? '#16A34A' : '#E5DDD4' }} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex-1">

          {/* Step 1 — Séjour */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Apt summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#FBF8F4', border: '1px solid #E5DDD4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={apt.img} alt={apt.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[15px] truncate">{apt.name}</div>
                  <div className="text-[12px] text-[#7A6550]">{apt.loc}</div>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                  <div className="font-black text-[18px]" style={{ color: '#E07A2F', fontFamily: 'var(--font-heading)' }}>
                    {apt.price.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-[11px] text-[#7A6550]">XAF / nuit</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Date d&apos;arrivée <span className="text-red-500">*</span></span>
                  <input type="date" value={arrivee} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setArrivee(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-all"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')}
                  />
                </label>
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Date de départ <span className="text-red-500">*</span></span>
                  <input type="date" value={depart} min={arrivee || new Date().toISOString().split('T')[0]}
                    onChange={e => setDepart(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-all"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')}
                  />
                </label>
              </div>

              {nights > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold"
                  style={{ background: '#FEF0E6', border: '1px solid #FDDCBC', color: '#E07A2F' }}>
                  ⏱ {nights} nuit{nights > 1 ? 's' : ''} — Total : <strong>{total.toLocaleString('fr-FR')} XAF</strong>
                </div>
              )}

              <label>
                <span className="block text-[13px] font-semibold mb-1.5">Voyageurs <span className="text-red-500">*</span></span>
                <select value={pers} onChange={e => setPers(e.target.value)}
                  className="w-full max-w-[220px] rounded-lg px-3 py-2.5 text-[14px] outline-none"
                  style={{ border: '1.5px solid #E5DDD4' }}>
                  {['1 voyageur','2 voyageurs','3 voyageurs','4 voyageurs','5 voyageurs','6+ voyageurs'].map(v => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Step 2 — Identité */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Prénom', value: prenom, set: setPrenom, placeholder: 'Jean',   req: true },
                  { label: 'Nom',    value: nom,    set: setNom,    placeholder: 'Mbemba', req: true },
                ].map(f => (
                  <label key={f.label}>
                    <span className="block text-[13px] font-semibold mb-1.5">{f.label}{f.req && <span className="text-red-500"> *</span>}</span>
                    <input type="text" value={f.value} placeholder={f.placeholder} onChange={e => f.set(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                      style={{ border: '1.5px solid #E5DDD4' }}
                      onFocus={e => (e.target.style.borderColor = '#16A34A')}
                      onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                  </label>
                ))}
              </div>
              <label>
                <span className="block text-[13px] font-semibold mb-1.5">Email <span className="text-red-500">*</span></span>
                <input type="email" value={email} placeholder="vous@email.com" onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                  style={{ border: '1.5px solid #E5DDD4' }}
                  onFocus={e => (e.target.style.borderColor = '#16A34A')}
                  onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Téléphone <span className="text-red-500">*</span></span>
                  <input type="tel" value={tel} placeholder="+242 06 000 00 00" onChange={e => setTel(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#16A34A')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                </label>
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">WhatsApp</span>
                  <input type="tel" value={wapp} placeholder="Si différent" onChange={e => setWapp(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#16A34A')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                </label>
              </div>

              {/* Type client */}
              <div>
                <span className="block text-[13px] font-semibold mb-2">Type de client <span className="text-red-500">*</span></span>
                <div className="flex gap-3">
                  {(['particulier', 'professionnel'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className="flex-1 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${type === t ? '#E07A2F' : '#E5DDD4'}`,
                        background: type === t ? '#FEF0E6' : '#fff',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ border: `2px solid ${type === t ? '#E07A2F' : '#E5DDD4'}` }}>
                          {type === t && <div className="w-2 h-2 rounded-full" style={{ background: '#E07A2F' }} />}
                        </div>
                        <span className="text-[13px] font-bold capitalize">{t}</span>
                      </div>
                      <div className="text-[11px] text-[#7A6550] mt-0.5 ml-6">
                        {t === 'particulier' ? 'Voyage personnel' : 'Mission ou entreprise'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {type === 'professionnel' && (
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Société <span className="text-red-500">*</span></span>
                  <input type="text" value={societe} placeholder="SARL Mon Entreprise" onChange={e => setSociete(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#16A34A')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                </label>
              )}
            </div>
          )}

          {/* Step 3 — Paiement */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <span className="block text-[13px] font-semibold mb-3">Mode de paiement <span className="text-red-500">*</span></span>
                <div className="grid grid-cols-3 gap-3">
                  {PAY_OPTIONS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPay(p.id)}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{
                        border: `1.5px solid ${pay === p.id ? p.color : '#E5DDD4'}`,
                        background: pay === p.id ? p.bg : '#fff',
                      }}
                    >
                      <div className="text-[12px] font-bold" style={{ color: pay === p.id ? p.color : '#7A6550' }}>
                        {p.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span className="block text-[13px] font-semibold mb-1.5">Demandes spéciales</span>
                <textarea rows={3} value={demandes} onChange={e => setDemandes(e.target.value)}
                  placeholder="Arrivée tardive, lit bébé, régime alimentaire…"
                  className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none resize-y"
                  style={{ border: '1.5px solid #E5DDD4' }}
                  onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                  onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
              </label>
              <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: '#DBEAFE', border: '1px solid #93C5FD', color: '#0369A1' }}>
                La caution est versée à l&apos;arrivée. Confirmation WhatsApp sous 30 minutes.
              </div>
            </div>
          )}

          {/* Step 4 — Confirmation */}
          {step === 4 && !confirmed && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden" style={{ background: '#FBF8F4', border: '1px solid #E5DDD4' }}>
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#1A0E06' }}>
                  <span className="text-white font-bold text-[14px]">Récapitulatif</span>
                  <span className="ml-auto font-mono text-[13px] font-bold" style={{ color: '#E07A2F' }}>
                    RES-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9000) + 1000)}
                  </span>
                </div>
                {[
                  ['Appartement', apt.name],
                  ['Arrivée',     fmtDate(arrivee)],
                  ['Départ',      fmtDate(depart)],
                  ['Durée',       `${nights} nuit${nights > 1 ? 's' : ''}`],
                  ['Voyageurs',   pers],
                  ['Client',      `${prenom} ${nom}`],
                  ['Paiement',    PAY_OPTIONS.find(p => p.id === pay)?.label ?? pay],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-2.5 text-[14px]"
                    style={{ borderBottom: '1px solid #E5DDD4' }}>
                    <span className="text-[#7A6550]">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3" style={{ background: '#FEF0E6' }}>
                  <span className="font-bold text-[15px]">Total</span>
                  <span className="font-black text-[22px]" style={{ color: '#E07A2F', fontFamily: 'var(--font-heading)' }}>
                    {total.toLocaleString('fr-FR')} XAF
                  </span>
                </div>
              </div>
              <p className="text-center text-[13px] text-[#7A6550]">
                En confirmant, vous acceptez nos conditions de réservation.
              </p>
              <button onClick={confirm}
                className="w-full py-3.5 rounded-xl font-black text-white text-[15px] transition-all"
                style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
                onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}>
                Confirmer la réservation
              </button>
            </div>
          )}

          {/* Success */}
          {step === 4 && confirmed && (
            <div className="text-center py-6">
              <div className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#DCFCE7', border: '3px solid #16A34A', width: '72px', height: '72px', animation: 'popIn .4s ease' }}>
                <CheckCircle2 size={36} style={{ color: '#16A34A' }} />
              </div>
              <h3 className="font-black text-[22px] text-[#1A0E06] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Réservation envoyée !
              </h3>
              <p className="text-[#7A6550] mb-1">
                Référence : <strong style={{ color: '#E07A2F', fontFamily: 'var(--font-heading)' }}>{ref}</strong>
              </p>
              <p className="text-[#7A6550] mb-6">Notre équipe vous contacte sous <strong>30 minutes</strong>.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {[
                  { icon: <MessageCircle size={14} />, label: 'WhatsApp confirmé', bg: '#DCFCE7', color: '#15803D', border: '#86EFAC' },
                  { icon: <Mail size={14} />,          label: 'Email envoyé',      bg: '#DBEAFE', color: '#0369A1', border: '#93C5FD' },
                  { icon: <Phone size={14} />,         label: 'SMS envoyé',        bg: '#FEF0E6', color: '#E07A2F', border: '#FDDCBC' },
                ].map(n => (
                  <span key={n.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold"
                    style={{ background: n.bg, color: n.color, border: `1.5px solid ${n.border}` }}>
                    {n.icon}{n.label}
                  </span>
                ))}
              </div>
              <button onClick={onClose}
                className="mt-6 px-8 py-3 rounded-xl font-bold text-white"
                style={{ background: '#16A34A', fontFamily: 'var(--font-heading)' }}>
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!(step === 4 && confirmed) && (
          <div className="sticky bottom-0 bg-white px-7 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid #E5DDD4' }}>
            <span className="text-[12px] text-[#7A6550]">Étape {step} / 4</span>
            <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => setStep(s => (s - 1) as Step)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all"
                  style={{ background: '#fff', border: '1.5px solid #E5DDD4', color: '#1A0E06', fontFamily: 'var(--font-heading)' }}>
                  <ChevronLeft size={15} /> Retour
                </button>
              )}
              {step < 4 && (
                <button onClick={next}
                  className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                  style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}>
                  {step === 3 ? 'Voir le récapitulatif →' : 'Continuer →'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes popIn   { 0%{transform:scale(0)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  )
}

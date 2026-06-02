'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, CheckCircle2, MessageCircle, Loader2, AlertCircle, ExternalLink, Smartphone, RefreshCw } from 'lucide-react'

type Apt = { name: string; loc: string; price: number; img: string; documentId?: string }
type Step = 1 | 2 | 3 | 4
type MobilePayStatut = 'idle' | 'initiating' | 'polling' | 'success' | 'failed' | 'timeout'

const PAY_OPTIONS = [
  { id: 'airtel_money', label: 'Airtel Money',  color: '#E07A2F', bg: '#FEF0E6', mobile: true  },
  { id: 'mtn_momo',     label: 'MTN MoMo',      color: '#CA8A04', bg: '#FEF9E6', mobile: true  },
  { id: 'espece',       label: 'Espèces',        color: '#16A34A', bg: '#DCFCE7', mobile: false },
  { id: 'virement',     label: 'Virement',       color: '#0369A1', bg: '#DBEAFE', mobile: false },
  { id: 'cheque',       label: 'Chèque',         color: '#7C3AED', bg: '#F3E8FF', mobile: false },
]

const MOBILE_PAY_IDS = new Set(['airtel_money', 'mtn_momo'])

const STEP_LABELS = ['Votre séjour', 'Vos informations', 'Paiement', 'Confirmation']

type DispoState = 'idle' | 'checking' | 'disponible' | 'indisponible' | 'error'

type Props = { apt: Apt | null; onClose: () => void }

export default function BookingModal({ apt, onClose }: Props) {
  const [step,      setStep]     = useState<Step>(1)
  const [nights,    setNights]   = useState(0)
  const [pay,       setPay]      = useState('')
  const [confirmed, setConfirm]  = useState(false)
  const [ref,       setRef]      = useState('')
  const [waUrl,     setWaUrl]    = useState('')
  const [loading,       setLoading]       = useState(false)
  const [errMsg,        setErrMsg]        = useState('')
  const [dispo,         setDispo]         = useState<DispoState>('idle')
  const [telMobile,     setTelMobile]     = useState('')
  const [mobileStatut,  setMobileStatut]  = useState<MobilePayStatut>('idle')
  const [transactionId, setTransactionId] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCount = useRef(0)

  // form
  const [arrivee,  setArrivee]  = useState('')
  const [depart,   setDepart]   = useState('')
  const [pers,     setPers]     = useState('1 voyageur')
  const [prenom,   setPrenom]   = useState('')
  const [nom,      setNom]      = useState('')
  const [email,    setEmail]    = useState('')
  const [tel,      setTel]      = useState('')
  const [wapp,     setWapp]     = useState('')
  const [type,     setType]     = useState<'particulier' | 'professionnel'>('particulier')
  const [societe,  setSociete]  = useState('')
  const [demandes, setDemandes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (arrivee && depart) {
      const n = Math.round((new Date(depart).getTime() - new Date(arrivee).getTime()) / 86400000)
      setNights(n > 0 ? n : 0)
    } else {
      setNights(0)
    }
  }, [arrivee, depart])

  useEffect(() => {
    if (apt) {
      setStep(1); setConfirm(false); setRef(''); setPay('')
      setDispo('idle'); setErrMsg('')
      setMobileStatut('idle'); setTransactionId(''); setTelMobile('')
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [apt])

  // Polling statut paiement mobile
  const startPolling = useCallback((txId: string, operateur: string) => {
    pollCount.current = 0
    pollRef.current = setInterval(async () => {
      pollCount.current++
      if (pollCount.current > 18) { // 90s timeout
        clearInterval(pollRef.current!)
        setMobileStatut('timeout')
        return
      }
      try {
        const res  = await fetch(`/api/paiement/verifier?operateur=${operateur}&transactionId=${txId}`)
        const data = await res.json()
        if (data.statut === 'reussi') {
          clearInterval(pollRef.current!)
          setMobileStatut('success')
          // Avancer automatiquement au récapitulatif
          setTimeout(() => setStep(4), 800)
        } else if (data.statut === 'echoue') {
          clearInterval(pollRef.current!)
          setMobileStatut('failed')
        }
      } catch { /* retry next tick */ }
    }, 5000)
  }, [])

  const initierPaiementMobile = async () => {
    if (!telMobile.trim()) { setErrMsg('Entrez votre numéro Mobile Money.'); return }
    setErrMsg(''); setMobileStatut('initiating')
    try {
      const res  = await fetch('/api/paiement/initier', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operateur:  pay,
          telephone:  telMobile,
          montant:    total,
          reference:  `PRE-${Date.now()}`,
          devise:     'XAF',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setMobileStatut('failed'); setErrMsg(data.error ?? 'Échec paiement'); return }
      setTransactionId(data.transactionId)
      setMobileStatut('polling')
      startPolling(data.transactionId, pay)
    } catch {
      setMobileStatut('failed')
      setErrMsg('Erreur réseau. Réessayez.')
    }
  }

  useEffect(() => {
    document.body.style.overflow = apt ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [apt])

  // Vérification disponibilité réelle dès que les deux dates sont saisies
  const checkDispo = useCallback(async (arr: string, dep: string) => {
    if (!arr || !dep || !apt?.documentId) return
    const n = Math.round((new Date(dep).getTime() - new Date(arr).getTime()) / 86400000)
    if (n <= 0) return
    setDispo('checking')
    try {
      const res = await fetch(`/api/disponibilite?appartement=${apt.documentId}&arrivee=${arr}&depart=${dep}`)
      const data = await res.json()
      setDispo(data.disponible ? 'disponible' : 'indisponible')
    } catch {
      setDispo('error')
    }
  }, [apt?.documentId])

  useEffect(() => {
    if (arrivee && depart) checkDispo(arrivee, depart)
    else setDispo('idle')
  }, [arrivee, depart, checkDispo])

  if (!apt) return null

  const total = nights * apt.price
  const nbPers = parseInt(pers) || 1

  const next = () => {
    setErrMsg('')
    if (step === 1) {
      if (!arrivee || !depart || nights <= 0) { setErrMsg('Veuillez renseigner des dates valides.'); return }
      if (dispo === 'indisponible') { setErrMsg('Cet appartement n\'est pas disponible sur ces dates.'); return }
      if (dispo === 'checking') { setErrMsg('Vérification en cours…'); return }
    }
    if (step === 2 && (!prenom || !nom || !email || !tel)) { setErrMsg('Veuillez remplir tous les champs obligatoires.'); return }
    if (step === 3 && !pay) { setErrMsg('Veuillez choisir un mode de paiement.'); return }
    if (step < 4) setStep(s => (s + 1) as Step)
  }

  const confirm = async () => {
    setLoading(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/reserver', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appartement_id:    apt.documentId,
          appartement_titre: apt.name,
          arrivee, depart,
          nb_nuits:     nights,
          nb_personnes: nbPers,
          prix_total:   total,
          prenom, nom, email,
          telephone: tel,
          whatsapp:  wapp || tel,
          type_client: type,
          societe, mode_paiement: pay,
          demandes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error ?? 'Erreur lors de la réservation.'); return }
      setRef(data.reference)
      setWaUrl(data.whatsappUrl)

      // Si mobile money et réservation créée → initier paiement avec documentId serveur
      if (MOBILE_PAY_IDS.has(pay) && data.documentId && telMobile) {
        const payRes  = await fetch('/api/paiement/initier', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operateur: pay, telephone: telMobile, reservation_documentId: data.documentId }),
        })
        const payData = await payRes.json()
        if (payRes.ok && payData.transactionId) {
          setTransactionId(payData.transactionId)
          setMobileStatut('polling')
          startPolling(payData.transactionId, pay)
        }
      }

      setConfirm(true)
    } catch {
      setErrMsg('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const fmtDate = (d: string) =>
    d ? new Date(d + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,14,6,.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white flex flex-col"
        style={{ boxShadow: '0 32px 80px rgba(26,14,6,.25)', animation: 'slideUp .22s ease' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-7 py-5"
          style={{ borderBottom: '1px solid #E5DDD4' }}>
          <div>
            <div className="font-black text-[17px] text-[#1A0E06]" style={{ fontFamily: 'var(--font-heading)' }}>
              Réserver {apt.name}
            </div>
            <div className="text-[12px] text-[#7A6550] mt-0.5">Étape {step} / 4 — {STEP_LABELS[step - 1]}</div>
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
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-all"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    background: s < step ? '#16A34A' : s === step ? '#E07A2F' : '#fff',
                    color:      s <= step ? '#fff' : '#7A6550',
                    border:     `2px solid ${s < step ? '#16A34A' : s === step ? '#E07A2F' : '#E5DDD4'}`,
                  }}>
                  {s < step ? <CheckCircle2 size={14} /> : s}
                </div>
                <span className="text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: s === step ? '#E07A2F' : s < step ? '#16A34A' : '#7A6550' }}>
                  {STEP_LABELS[s - 1]}
                </span>
              </div>
              {i < 3 && <div className="flex-1 h-0.5 mx-1 mb-4 transition-all" style={{ background: s < step ? '#16A34A' : '#E5DDD4' }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="px-7 py-6 flex-1">

          {/* Step 1 — Séjour */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Résumé appart */}
              <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#FBF8F4', border: '1px solid #E5DDD4' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={apt.img || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=80&h=80&fit=crop'}
                  alt={apt.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-[15px] truncate">{apt.name}</div>
                  <div className="text-[12px] text-[#7A6550]">{apt.loc}</div>
                </div>
                <div className="ml-auto text-right flex-shrink-0">
                  <div className="font-black text-[18px]" style={{ color: '#1A0E06', fontFamily: 'var(--font-heading)' }}>
                    {apt.price.toLocaleString('fr-FR')}
                  </div>
                  <div className="text-[11px] text-[#7A6550]">XAF / nuit</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Date d&apos;arrivée <span className="text-red-500">*</span></span>
                  <input type="date" value={arrivee} min={today}
                    onChange={e => { setArrivee(e.target.value); if (depart && e.target.value >= depart) setDepart('') }}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-all"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                </label>
                <label>
                  <span className="block text-[13px] font-semibold mb-1.5">Date de départ <span className="text-red-500">*</span></span>
                  <input type="date" value={depart} min={arrivee || today}
                    onChange={e => setDepart(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none transition-all"
                    style={{ border: '1.5px solid #E5DDD4' }}
                    onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                    onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
                </label>
              </div>

              {/* Indicateur disponibilité */}
              {arrivee && depart && nights > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold"
                  style={{
                    background: dispo === 'disponible' ? '#DCFCE7' : dispo === 'indisponible' ? '#FEE2E2' : dispo === 'checking' ? '#DBEAFE' : '#FEF0E6',
                    border: `1px solid ${dispo === 'disponible' ? '#86EFAC' : dispo === 'indisponible' ? '#FCA5A5' : dispo === 'checking' ? '#93C5FD' : '#FDDCBC'}`,
                    color: dispo === 'disponible' ? '#15803D' : dispo === 'indisponible' ? '#B91C1C' : dispo === 'checking' ? '#0369A1' : '#E07A2F',
                  }}>
                  {dispo === 'checking'      && <><Loader2 size={14} className="animate-spin flex-shrink-0" /> Vérification disponibilité…</>}
                  {dispo === 'disponible'    && <><CheckCircle2 size={14} className="flex-shrink-0" /> Disponible — {nights} nuit{nights > 1 ? 's' : ''} · Total : <strong>{total.toLocaleString('fr-FR')} XAF</strong></>}
                  {dispo === 'indisponible'  && <><AlertCircle size={14} className="flex-shrink-0" /> Non disponible sur ces dates</>}
                  {dispo === 'error'         && <><AlertCircle size={14} className="flex-shrink-0" /> Impossible de vérifier — réservez quand même</>}
                  {dispo === 'idle' && nights > 0 && <>⏱ {nights} nuit{nights > 1 ? 's' : ''} — Total : <strong>{total.toLocaleString('fr-FR')} XAF</strong></>}
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
              <div>
                <span className="block text-[13px] font-semibold mb-2">Type de client <span className="text-red-500">*</span></span>
                <div className="flex gap-3">
                  {(['particulier', 'professionnel'] as const).map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className="flex-1 px-4 py-3 rounded-xl text-left transition-all"
                      style={{ border: `1.5px solid ${type === t ? '#E07A2F' : '#E5DDD4'}`, background: type === t ? '#FEF0E6' : '#fff' }}>
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
                    <button key={p.id}
                      onClick={() => { setPay(p.id); setMobileStatut('idle'); setErrMsg('') }}
                      className="p-3 rounded-xl text-center transition-all"
                      style={{ border: `1.5px solid ${pay === p.id ? p.color : '#E5DDD4'}`, background: pay === p.id ? p.bg : '#fff' }}>
                      {p.mobile && <Smartphone size={14} className="mx-auto mb-1" style={{ color: pay === p.id ? p.color : '#B8A898' }} />}
                      <div className="text-[12px] font-bold" style={{ color: pay === p.id ? p.color : '#7A6550' }}>{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Panneau Mobile Money ── */}
              {MOBILE_PAY_IDS.has(pay) && (
                <div className="rounded-xl p-4 space-y-4" style={{ background:'#FBF8F4', border:'1px solid #E5DDD4' }}>
                  {mobileStatut === 'idle' && (
                    <>
                      <div className="text-[13px] font-semibold text-[#1A0E06]">
                        Payer <strong style={{ color:'#E07A2F' }}>{total.toLocaleString('fr-FR')} XAF</strong> via {PAY_OPTIONS.find(p=>p.id===pay)?.label}
                      </div>
                      <label>
                        <span className="block text-[12px] font-semibold mb-1.5 text-[#7A6550]">Numéro Mobile Money</span>
                        <input type="tel" value={telMobile}
                          onChange={e => setTelMobile(e.target.value)}
                          placeholder={pay === 'airtel_money' ? '06 XXX XX XX' : '06 XXX XX XX'}
                          className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                          style={{ border:'1.5px solid #E5DDD4', background:'#fff' }}
                          onFocus={e => (e.target.style.borderColor='#E07A2F')}
                          onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
                      </label>
                      <button onClick={initierPaiementMobile}
                        className="w-full py-2.5 rounded-xl font-bold text-white text-[13px] transition-all"
                        style={{ background: pay === 'mtn_momo' ? '#CA8A04' : '#E07A2F', fontFamily:'var(--font-heading)' }}>
                        Envoyer la demande de paiement
                      </button>
                    </>
                  )}

                  {mobileStatut === 'initiating' && (
                    <div className="flex items-center gap-3 text-[13px] text-[#0369A1]">
                      <Loader2 size={18} className="animate-spin flex-shrink-0" />
                      Envoi de la demande…
                    </div>
                  )}

                  {mobileStatut === 'polling' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:'#DBEAFE' }}>
                          <Smartphone size={18} style={{ color:'#0369A1' }} />
                        </div>
                        <div>
                          <div className="font-bold text-[14px] text-[#1A0E06]">Vérifiez votre téléphone</div>
                          <div className="text-[12px] text-[#7A6550]">Tapez votre PIN {PAY_OPTIONS.find(p=>p.id===pay)?.label} pour valider</div>
                        </div>
                        <Loader2 size={16} className="ml-auto animate-spin text-[#0369A1] flex-shrink-0" />
                      </div>
                      <div className="text-[11px] text-[#7A6550] text-center">Vérification automatique en cours…</div>
                    </div>
                  )}

                  {mobileStatut === 'success' && (
                    <div className="flex items-center gap-3 text-[#16A34A]">
                      <CheckCircle2 size={20} className="flex-shrink-0" />
                      <div>
                        <div className="font-bold text-[14px]">Paiement confirmé !</div>
                        <div className="text-[12px]">Passage au récapitulatif…</div>
                      </div>
                    </div>
                  )}

                  {(mobileStatut === 'failed' || mobileStatut === 'timeout') && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[#B91C1C] text-[13px]">
                        <AlertCircle size={16} className="flex-shrink-0" />
                        {mobileStatut === 'timeout' ? 'Délai dépassé — le paiement n\'a pas été confirmé.' : 'Paiement refusé ou annulé.'}
                      </div>
                      <button onClick={() => { setMobileStatut('idle'); setTransactionId('') }}
                        className="flex items-center gap-1.5 text-[12px] font-bold transition-colors"
                        style={{ color:'#E07A2F' }}>
                        <RefreshCw size={12} /> Réessayer
                      </button>
                    </div>
                  )}
                </div>
              )}

              <label>
                <span className="block text-[13px] font-semibold mb-1.5">Demandes spéciales</span>
                <textarea rows={3} value={demandes} onChange={e => setDemandes(e.target.value)}
                  placeholder="Arrivée tardive, lit bébé, régime alimentaire…"
                  className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none resize-y"
                  style={{ border: '1.5px solid #E5DDD4' }}
                  onFocus={e => (e.target.style.borderColor = '#E07A2F')}
                  onBlur={e => (e.target.style.borderColor = '#E5DDD4')} />
              </label>

              {!MOBILE_PAY_IDS.has(pay) && (
                <div className="rounded-xl px-4 py-3 text-[13px]"
                  style={{ background: '#DBEAFE', border: '1px solid #93C5FD', color: '#0369A1' }}>
                  La caution est versée à l&apos;arrivée. Confirmation WhatsApp sous 30 minutes.
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Récapitulatif */}
          {step === 4 && !confirmed && (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden" style={{ background: '#FBF8F4', border: '1px solid #E5DDD4' }}>
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#1A0E06' }}>
                  <span className="text-white font-bold text-[14px]">Récapitulatif</span>
                </div>
                {[
                  ['Appartement', apt.name],
                  ['Arrivée',     fmtDate(arrivee)],
                  ['Départ',      fmtDate(depart)],
                  ['Durée',       `${nights} nuit${nights > 1 ? 's' : ''}`],
                  ['Voyageurs',   pers],
                  ['Client',      `${prenom} ${nom}`],
                  ['Email',       email],
                  ['Téléphone',   tel],
                  ['Paiement',    PAY_OPTIONS.find(p => p.id === pay)?.label ?? pay],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-4 py-2.5 text-[14px]"
                    style={{ borderBottom: '1px solid #E5DDD4' }}>
                    <span className="text-[#7A6550]">{k}</span>
                    <span className="font-semibold text-right max-w-[60%] truncate">{v}</span>
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
              <button onClick={confirm} disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-[15px] transition-all flex items-center justify-center gap-2"
                style={{ background: loading ? '#B85E18' : '#E07A2F', fontFamily: 'var(--font-heading)', opacity: loading ? .8 : 1 }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B85E18' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#E07A2F' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours…</> : 'Confirmer la réservation'}
              </button>
            </div>
          )}

          {/* Success */}
          {step === 4 && confirmed && (
            <div className="text-center py-6">
              <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#DCFCE7', border: '3px solid #16A34A', animation: 'popIn .4s ease' }}>
                <CheckCircle2 size={36} style={{ color: '#16A34A' }} />
              </div>
              <h3 className="font-black text-[22px] text-[#1A0E06] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                Réservation enregistrée !
              </h3>
              <p className="text-[#7A6550] mb-1">
                Référence : <strong style={{ color: '#1A0E06', fontFamily: 'var(--font-heading)' }}>{ref}</strong>
              </p>
              <p className="text-[#7A6550] mb-6">Notre équipe vous contacte sous <strong>30 minutes</strong>.</p>

              {/* Bouton WhatsApp principal */}
              {waUrl && (
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-white text-[15px] mb-4 transition-all"
                  style={{ background: '#16A34A', fontFamily: 'var(--font-heading)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#15803D')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#16A34A')}>
                  <MessageCircle size={18} />
                  Confirmer sur WhatsApp
                  <ExternalLink size={14} />
                </a>
              )}

              <div className="flex justify-center gap-3 flex-wrap mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold"
                  style={{ background: '#DCFCE7', color: '#15803D', border: '1.5px solid #86EFAC' }}>
                  <CheckCircle2 size={11} /> Sauvegardée en base
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold"
                  style={{ background: '#FEF0E6', color: '#E07A2F', border: '1.5px solid #FDDCBC' }}>
                  <CheckCircle2 size={11} /> En attente confirmation
                </span>
              </div>
              <button onClick={onClose}
                className="px-8 py-3 rounded-xl font-bold text-[#7A6550] transition-all"
                style={{ border: '1.5px solid #E5DDD4' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#E07A2F')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5DDD4')}>
                Fermer
              </button>
            </div>
          )}
        </div>

        {/* Message d'erreur */}
        {errMsg && (
          <div className="mx-7 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold"
            style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C' }}>
            <AlertCircle size={14} className="flex-shrink-0" /> {errMsg}
          </div>
        )}

        {/* Footer boutons */}
        {!(step === 4 && confirmed) && (
          <div className="sticky bottom-0 bg-white px-7 py-4 flex items-center justify-between"
            style={{ borderTop: '1px solid #E5DDD4' }}>
            <span className="text-[12px] text-[#7A6550]">Étape {step} / 4</span>
            <div className="flex gap-3">
              {step > 1 && (
                <button onClick={() => { setStep(s => (s - 1) as Step); setErrMsg('') }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all"
                  style={{ background: '#fff', border: '1.5px solid #E5DDD4', color: '#1A0E06', fontFamily: 'var(--font-heading)' }}>
                  <ChevronLeft size={15} /> Retour
                </button>
              )}
              {step < 4 && (
                <button onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                  style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}>
                  {step === 3 ? 'Voir le récapitulatif →' : 'Continuer →'}
                </button>
              )}
              {step === 4 && !confirmed && (
                <button onClick={confirm} disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all"
                  style={{ background: '#E07A2F', fontFamily: 'var(--font-heading)' }}>
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  Confirmer
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

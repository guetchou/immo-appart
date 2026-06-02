'use client'

import { useState, useEffect } from 'react'
import { X, Star, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'

type Props = {
  open:              boolean
  appartementId:     string
  appartementTitre:  string
  onClose:           () => void
}

const CRITERES = [
  { key: 'note_proprete',          label: 'Propreté'          },
  { key: 'note_communication',     label: 'Communication'     },
  { key: 'note_emplacement',       label: 'Emplacement'       },
  { key: 'note_rapport_qualite_prix', label: 'Rapport qualité/prix' },
] as const

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} étoile${n>1?'s':''}`}
        >
          <Star
            size={28}
            fill={(hover || value) >= n ? '#E07A2F' : 'none'}
            stroke={(hover || value) >= n ? '#E07A2F' : '#D1C4B8'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

export default function AvisModal({ open, appartementId, appartementTitre, onClose }: Props) {
  const [prenom,      setPrenom]      = useState('')
  const [note,        setNote]        = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [origine,     setOrigine]     = useState('')
  const [sousNotes,   setSousNotes]   = useState<Record<string, number>>({})
  const [loading,     setLoading]     = useState(false)
  const [errMsg,      setErrMsg]      = useState('')
  const [done,        setDone]        = useState(false)

  // Pré-remplir depuis la session
  useEffect(() => {
    if (!open) return
    try {
      const stored = sessionStorage.getItem('ndombi_user')
      if (stored) {
        const u = JSON.parse(stored)
        setPrenom(u.username?.split(' ')[0] ?? '')
      }
    } catch { /* ignore */ }
    setDone(false); setErrMsg(''); setNote(0); setCommentaire('')
  }, [open])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErrMsg('')
    if (!prenom.trim())       { setErrMsg('Veuillez entrer votre prénom.'); return }
    if (note === 0)           { setErrMsg('Veuillez attribuer une note globale.'); return }
    if (commentaire.length < 20) { setErrMsg('Le commentaire doit faire au moins 20 caractères.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/deposer-avis', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appartement_id: appartementId,
          prenom_auteur:  prenom.trim(),
          note_globale:   note,
          commentaire:    commentaire.trim(),
          origine:        origine.trim() || undefined,
          ...sousNotes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error ?? 'Erreur lors de l\'envoi.'); return }
      setDone(true)
    } catch {
      setErrMsg('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background:'rgba(26,14,6,.55)', backdropFilter:'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white"
        style={{ boxShadow:'0 32px 80px rgba(26,14,6,.25)', animation:'slideUp .22s ease' }}>

        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-7 py-5 z-10"
          style={{ borderBottom:'1px solid #E5DDD4' }}>
          <div>
            <div className="font-black text-[17px] text-[#1A0E06]" style={{ fontFamily:'var(--font-heading)' }}>
              Laisser un avis
            </div>
            <div className="text-[12px] text-[#7A6550] mt-0.5">{appartementTitre}</div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#FBF8F4] transition-colors"
            style={{ border:'1.5px solid #E5DDD4', color:'#7A6550' }}>
            <X size={16} />
          </button>
        </div>

        {done ? (
          /* Succès */
          <div className="text-center px-7 py-12">
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background:'#DCFCE7', border:'3px solid #16A34A', animation:'popIn .4s ease' }}>
              <CheckCircle2 size={36} style={{ color:'#16A34A' }} />
            </div>
            <h3 className="font-black text-[20px] text-[#1A0E06] mb-2" style={{ fontFamily:'var(--font-heading)' }}>
              Merci pour votre avis !
            </h3>
            <p className="text-[#7A6550] text-[14px] mb-6">
              Votre avis sera affiché après validation par notre équipe.
            </p>
            <button onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold text-white"
              style={{ background:'#E07A2F', fontFamily:'var(--font-heading)' }}>
              Fermer
            </button>
          </div>
        ) : (
          /* Formulaire */
          <form onSubmit={submit} className="px-7 py-6 space-y-6">

            {/* Prénom */}
            <label>
              <span className="block text-[13px] font-semibold mb-1.5">Votre prénom <span className="text-red-500">*</span></span>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                placeholder="Jean" maxLength={50}
                className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                style={{ border:'1.5px solid #E5DDD4' }}
                onFocus={e => (e.target.style.borderColor='#E07A2F')}
                onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
            </label>

            {/* Origine */}
            <label>
              <span className="block text-[13px] font-semibold mb-1.5">
                Ville & type de séjour <span className="text-[#7A6550] font-normal">(optionnel)</span>
              </span>
              <input type="text" value={origine} onChange={e => setOrigine(e.target.value)}
                placeholder="Paris, France · Séjour professionnel" maxLength={80}
                className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none"
                style={{ border:'1.5px solid #E5DDD4' }}
                onFocus={e => (e.target.style.borderColor='#E07A2F')}
                onBlur={e => (e.target.style.borderColor='#E5DDD4')} />
            </label>

            {/* Note globale */}
            <div>
              <span className="block text-[13px] font-semibold mb-3">Note globale <span className="text-red-500">*</span></span>
              <StarPicker value={note} onChange={setNote} />
              {note > 0 && (
                <span className="text-[12px] text-[#7A6550] mt-1 block">
                  {['','Décevant','Passable','Bien','Très bien','Excellent'][note]}
                </span>
              )}
            </div>

            {/* Sous-notes */}
            <div>
              <span className="block text-[13px] font-semibold mb-3">Notes détaillées <span className="text-[#7A6550] font-normal">(optionnel)</span></span>
              <div className="grid grid-cols-2 gap-4">
                {CRITERES.map(c => (
                  <div key={c.key}>
                    <div className="text-[12px] text-[#7A6550] mb-1.5">{c.label}</div>
                    <StarPicker
                      value={sousNotes[c.key] ?? 0}
                      onChange={v => setSousNotes(prev => ({ ...prev, [c.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Commentaire */}
            <label>
              <span className="block text-[13px] font-semibold mb-1.5">Votre avis <span className="text-red-500">*</span></span>
              <textarea
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
                rows={4}
                maxLength={1000}
                placeholder="Décrivez votre expérience : l'appartement, l'accueil, les services…"
                className="w-full rounded-lg px-3 py-2.5 text-[14px] outline-none resize-y"
                style={{ border:'1.5px solid #E5DDD4' }}
                onFocus={e => (e.target.style.borderColor='#E07A2F')}
                onBlur={e => (e.target.style.borderColor='#E5DDD4')}
              />
              <div className="text-[11px] text-[#7A6550] mt-1 text-right">{commentaire.length}/1000</div>
            </label>

            {/* Erreur */}
            {errMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold"
                style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', color:'#B91C1C' }}>
                <AlertCircle size={14} className="flex-shrink-0" /> {errMsg}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-[15px] transition-all flex items-center justify-center gap-2"
              style={{ background: loading ? '#B85E18' : '#E07A2F', fontFamily:'var(--font-heading)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#B85E18' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background='#E07A2F' }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Envoi en cours…</> : 'Publier mon avis'}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        @keyframes popIn   { 0%{transform:scale(0)} 70%{transform:scale(1.1)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, CheckCircle2 } from 'lucide-react'

type Segment  = { bold: boolean; text: string }
type Message  = { role: 'agent' | 'user'; segments: Segment[] }
type QuickReply = { label: string; response: string }
export type ChatConfig = {
  actif?: boolean
  agent_nom?: string
  agent_statut?: string
  agent_photo_url?: string
  message_accueil?: string
  message_fallback?: string
  message_reponse_libre?: string
  placeholder?: string
  fermer_label?: string
  envoyer_label?: string
  ouvrir_label?: string
  reponses_rapides?: unknown
}

/** Parse **text** between ||bold|| markers — no HTML, no dangerouslySetInnerHTML */
function toSegments(raw: string): Segment[] {
  return raw.split('||').map((s, i) => ({ bold: i % 2 === 1, text: s }))
}

function BubbleText({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) =>
        s.bold ? <strong key={i}>{s.text}</strong> : <span key={i}>{s.text}</span>
      )}
    </>
  )
}

const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { label: 'Disponibilités', response: 'Consultez notre calendrier ou appelez le ||+242 06 435 90 90|| pour vérifier les disponibilités.' },
  { label: 'Tarifs', response: 'Nos tarifs débutent à ||45 000 XAF / nuit|| selon le type de résidence et la saison.' },
  { label: 'Réserver', response: 'Choisissez votre appartement, sélectionnez vos dates et remplissez le formulaire. Confirmation sous ||30 min|| !' },
  { label: 'Services', response: 'Navette aéroport, chef cuisinier, conciergerie, ménage quotidien et sécurité 24h/24.' },
]

function normalizeQuickReplies(value: unknown): QuickReply[] {
  if (!Array.isArray(value)) return DEFAULT_QUICK_REPLIES
  const replies = value
    .map(item => {
      if (!item || typeof item !== 'object') return null
      const candidate = item as { label?: unknown; reponse?: unknown; response?: unknown }
      const response = typeof candidate.response === 'string' ? candidate.response : candidate.reponse
      if (typeof candidate.label !== 'string' || typeof response !== 'string') return null
      return { label: candidate.label, response }
    })
    .filter((reply): reply is QuickReply => Boolean(reply))

  return replies.length ? replies : DEFAULT_QUICK_REPLIES
}

export default function ChatBot({ config = null }: { config?: ChatConfig | null }) {
  const quickReplies = normalizeQuickReplies(config?.reponses_rapides)
  const quickReplyMap = new Map(quickReplies.map(reply => [reply.label, reply.response]))
  const text = {
    agentName: config?.agent_nom ?? 'Agent NDOMBI',
    agentStatus: config?.agent_statut ?? 'En ligne · répond en <5 min',
    agentPhotoUrl: config?.agent_photo_url ?? 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face',
    welcome: config?.message_accueil ?? 'Bonjour ! Je suis l\'assistant Résidence NDOMBI. Comment puis-je vous aider ?',
    fallback: config?.message_fallback ?? 'Un agent vous répond sous peu.',
    freeResponse: config?.message_reponse_libre ?? 'Merci ! Un agent NDOMBI vous répondra très vite. Appelez aussi le ||+242 06 435 90 90||.',
    placeholder: config?.placeholder ?? 'Votre message…',
    closeLabel: config?.fermer_label ?? 'Fermer',
    sendLabel: config?.envoyer_label ?? 'Envoyer',
    openLabel: config?.ouvrir_label ?? 'Chat',
  }
  const [open,   setOpen]   = useState(false)
  const [input,  setInput]  = useState('')
  const [msgs,   setMsgs]   = useState<Message[]>([
    { role: 'agent', segments: toSegments(text.welcome) },
  ])
  const [quickShown, setQuickShown] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMsgs([{ role: 'agent', segments: toSegments(text.welcome) }])
    setQuickShown(true)
  }, [text.welcome])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const addMsg = (role: Message['role'], segments: Segment[]) => {
    setMsgs(prev => [...prev, { role, segments }])
  }

  const handleQuick = (key: string) => {
    addMsg('user', toSegments(key))
    setQuickShown(false)
    setTimeout(() => addMsg('agent', toSegments(quickReplyMap.get(key) ?? text.fallback)), 600)
  }

  const handleSend = () => {
    const v = input.trim()
    if (!v) return
    addMsg('user', toSegments(v))
    setInput('')
    setQuickShown(false)
    setTimeout(() => addMsg(
      'agent',
      toSegments(text.freeResponse)
    ), 700)
  }

  if (config?.actif === false) return null

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">

      {/* Chat window */}
      {open && (
        <div
          className="w-[336px] rounded-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid #E5DDD4', boxShadow: '0 32px 80px rgba(26,14,6,.25)', animation: 'slideUp .22s ease' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: '#1A0E06' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={text.agentPhotoUrl}
              alt={text.agentName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              style={{ border: '2px solid #E07A2F' }}
            />
            <div>
              <div className="text-white font-bold text-[14px]">{text.agentName}</div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#22C55E' }}>
                <CheckCircle2 size={10} />
                {text.agentStatus}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,.5)' }}
              aria-label={text.closeLabel}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="px-4 py-4 flex flex-col gap-2.5 min-h-[160px] max-h-[260px] overflow-y-auto">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-snug ${
                  m.role === 'user'
                    ? 'self-end rounded-br-sm text-white'
                    : 'self-start rounded-bl-sm'
                }`}
                style={m.role === 'user'
                  ? { background: '#E07A2F', color: '#fff' }
                  : { background: '#F3EFE9', color: '#1C110A' }
                }
              >
                <BubbleText segments={m.segments} />
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {quickShown && (
            <div className="flex flex-wrap gap-2 px-4 pb-3">
              {quickReplies.map(reply => (
                <button
                  key={reply.label}
                  onClick={() => handleQuick(reply.label)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                  style={{ border: '1px solid #E07A2F', color: '#E07A2F', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E07A2F'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#E07A2F' }}
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 px-3 py-3" style={{ borderTop: '1px solid #E5DDD4' }}>
            <input
              className="flex-1 rounded-lg px-3 py-2 text-[13px] outline-none transition-all"
              style={{ border: '1.5px solid #E5DDD4', background: '#fff', color: '#1C110A' }}
              placeholder={text.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              onFocus={e => (e.target.style.borderColor = '#E07A2F')}
              onBlur={e => (e.target.style.borderColor = '#E5DDD4')}
            />
            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: '#E07A2F', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#B85E18')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E07A2F')}
              aria-label={text.sendLabel}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-[58px] h-[58px] rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
        style={{ background: '#E07A2F', boxShadow: '0 8px 28px rgba(224,122,47,.45)', color: '#fff' }}
        aria-label={text.openLabel}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && (
          <span
            className="absolute top-[3px] right-[3px] w-3.5 h-3.5 rounded-full"
            style={{ background: '#22C55E', border: '2px solid #fff' }}
          />
        )}
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(.96); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}

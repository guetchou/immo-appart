import { draftMode } from 'next/headers'
import Link from 'next/link'
import { Eye, X } from 'lucide-react'

export default async function PreviewBanner() {
  const draft = await draftMode()
  if (!draft.isEnabled) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-[200] flex items-center justify-between px-6 py-2.5"
      style={{ background: '#E07A2F', color: '#fff' }}
    >
      <div className="flex items-center gap-2 text-[13px] font-semibold">
        <Eye size={16} />
        Mode Preview actif — vous visualisez le contenu en brouillon
      </div>
      <Link
        href="/api/disable-preview"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
        style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}
      >
        <X size={14} /> Quitter la preview
      </Link>
    </div>
  )
}

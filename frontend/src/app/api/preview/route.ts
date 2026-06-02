import { draftMode } from 'next/headers'
import { redirect }  from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const secret     = searchParams.get('secret')
  const redirectTo = searchParams.get('redirect') ?? '/'
  const status     = searchParams.get('status')   ?? 'draft'

  // 1. Vérification du secret
  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Accès non autorisé', { status: 401 })
  }

  // 2. Validation de l'URL de redirection (sécurité — pas de redirection externe)
  if (!redirectTo.startsWith('/')) {
    return new Response('URL de redirection invalide', { status: 400 })
  }

  // 3. Activer ou désactiver le Draft Mode selon le statut
  const draft = await draftMode()
  if (status === 'published') {
    draft.disable()
  } else {
    draft.enable()
  }

  // 4. Rediriger vers la page frontend demandée
  redirect(redirectTo)
}

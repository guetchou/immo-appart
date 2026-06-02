import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MonEspaceClient from './MonEspaceClient'

export const metadata = { title: 'Mon espace — Résidence NDOMBI' }

export default async function MonEspacePage() {
  const jar = await cookies()
  const jwt = jar.get('ndombi_jwt')?.value
  if (!jwt) redirect('/login')
  return <MonEspaceClient />
}

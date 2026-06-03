import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { STRAPI_SERVER_URL } from '@/lib/strapi-server'
import { getFooterConfig, getNavigation } from '@/lib/strapi'
import { mapFooterProps } from '@/lib/footer-props'
import { mapNavbarProps } from '@/lib/navbar-props'
import MonEspaceClient from './MonEspaceClient'

export const metadata = { title: 'Mon espace — Résidence NDOMBI' }

const STRAPI = STRAPI_SERVER_URL

async function verifySession(jwt: string): Promise<boolean> {
  try {
    const res = await fetch(`${STRAPI}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

export default async function MonEspacePage() {
  const jar = await cookies()
  const jwt = jar.get('ndombi_jwt')?.value

  // Vérification côté serveur : le cookie doit exister ET être valide sur Strapi
  if (!jwt || !(await verifySession(jwt))) {
    redirect('/login')
  }

  const [navigation, footerConfig] = await Promise.all([
    getNavigation(),
    getFooterConfig(),
  ])
  return (
    <MonEspaceClient
      navProps={mapNavbarProps(navigation)}
      footerProps={mapFooterProps(footerConfig, navigation)}
    />
  )
}

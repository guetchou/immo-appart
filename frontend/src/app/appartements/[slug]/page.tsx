import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { STRAPI_SERVER_URL, readJsonResponse, strapiPublicUrl } from '@/lib/strapi-server'
import { getNavigation } from '@/lib/strapi'
import { mapNavbarProps } from '@/lib/navbar-props'
import AppartementClient from './AppartementClient'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 30

async function getAppartement(slug: string) {
  try {
    const STRAPI_URL = STRAPI_SERVER_URL
    const TOKEN      = process.env.STRAPI_API_TOKEN ?? ''

    // Strapi 5 : filtrer par slug avec populate complet
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[image_principale]': 'true',
      'populate[galerie]':          'true',
      'populate[equipements]':      'true',
      'populate[avis]':             'true',
      'populate[services_premium]': 'true',
      'populate[type_logement_ref]': 'true',
      'populate[politique_annulation_ref]': 'true',
      'populate[equipements_ref][populate][categorie_ref]': 'true',
    })

    const IS_DEV = process.env.NODE_ENV === 'development'
    const res = await fetch(`${STRAPI_URL}/api/appartements?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      },
      ...(IS_DEV ? { cache: 'no-store' as const } : { next: { tags: ['appartements'], revalidate: 30 } }),
    })

    if (!res.ok) return null
    const json = await readJsonResponse<{ data?: Record<string, unknown>[] }>(res, 'Strapi appartement detail')
    return (json.data?.[0] as Record<string, unknown>) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const apt = await getAppartement(slug)
  if (!apt) return { title: 'Appartement introuvable' }

  return {
    title: apt.titre as string,
    description: (apt.description_courte as string) ?? undefined,
    openGraph: {
      title:  apt.titre as string,
      images: apt.image_principale
        ? [{ url: strapiPublicUrl((apt.image_principale as { url: string }).url) ?? '' }]
        : [],
    },
  }
}

export default async function AppartementPage({ params }: Props) {
  const { slug } = await params
  const [apt, navigation] = await Promise.all([
    getAppartement(slug),
    getNavigation(),
  ])
  if (!apt) notFound()
  return <AppartementClient apt={apt} navProps={mapNavbarProps(navigation)} />
}

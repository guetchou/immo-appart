import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { strapiRequest } from '@/lib/strapi'
import AppartementClient from './AppartementClient'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 30

async function getAppartement(slug: string) {
  try {
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
    const TOKEN      = process.env.STRAPI_API_TOKEN ?? ''

    // Strapi 5 : filtrer par slug avec populate complet
    const params = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[image_principale]': 'true',
      'populate[galerie]':          'true',
      'populate[equipements]':      'true',
      'populate[avis]':             'true',
      'populate[services_premium]': 'true',
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
    const json = await res.json()
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
        ? [{ url: (apt.image_principale as { url: string }).url }]
        : [],
    },
  }
}

export default async function AppartementPage({ params }: Props) {
  const { slug } = await params
  const apt = await getAppartement(slug)
  if (!apt) notFound()
  return <AppartementClient apt={apt} />
}

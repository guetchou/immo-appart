import { Metadata } from 'next'
import { strapiRequest } from '@/lib/strapi'
import CatalogueClient from './CatalogueClient'

export const metadata: Metadata = {
  title: 'Appartements disponibles',
  description: 'Découvrez notre sélection de résidences de luxe à Pointe-Noire — studios, T2/T3, penthouses et villas.',
}

export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 30

async function getAppartementsAll() {
  try {
    const r = await strapiRequest<{ data: unknown[]; meta: unknown }>(
      '/appartements?populate=image_principale&sort=ordre_affichage:desc,createdAt:desc&pagination[pageSize]=50',
      { tags: ['appartements'] }
    )
    return { data: r.data, meta: r.meta }
  } catch {
    return { data: [], meta: null }
  }
}

export default async function AppartementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const { data: appartements } = await getAppartementsAll()
  return (
    <CatalogueClient
      appartements={appartements as never[]}
      initSearch={params.q ?? ''}
      initArrivee={params.arrivee ?? ''}
      initDepart={params.depart ?? ''}
      initPers={params.pers ? Number(params.pers) : 1}
    />
  )
}

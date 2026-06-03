import { Metadata } from 'next'
import { getNavigation, strapiRequest } from '@/lib/strapi'
import { mapNavbarProps } from '@/lib/navbar-props'
import CatalogueClient from './CatalogueClient'

export const metadata: Metadata = {
  title: 'Appartements disponibles',
  description: 'Découvrez notre sélection de résidences de luxe à Pointe-Noire — studios, T2/T3, penthouses et villas.',
}

export const revalidate = 30

async function getAppartementsAll() {
  try {
    const r = await strapiRequest<{ data: unknown[]; meta: unknown }>(
      '/appartements?populate[0]=image_principale&populate[1]=type_logement_ref&sort=ordre_affichage:desc,createdAt:desc&pagination[pageSize]=50',
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
  const [{ data: appartements }, navigation] = await Promise.all([
    getAppartementsAll(),
    getNavigation(),
  ])
  return (
    <CatalogueClient
      navProps={mapNavbarProps(navigation)}
      appartements={appartements as never[]}
      initSearch={params.q ?? ''}
      initArrivee={params.arrivee ?? ''}
      initDepart={params.depart ?? ''}
      initPers={params.pers ? Number(params.pers) : 1}
    />
  )
}

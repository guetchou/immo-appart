// Server Component — récupère les données Strapi côté serveur
import { getHomepage, getNavigation, getFooterConfig, getReseauxSociaux, getAppartements, getPublicationsSociales } from '@/lib/strapi'
import HomeClient from './HomeClient'

export const revalidate = 60 // ISR — revalider toutes les 60s

export default async function HomePage() {
  // Fetch en parallèle — toutes les sources Strapi
  const [homepage, navigation, footerConfig, reseauxSociaux, appartements, publications] = await Promise.all([
    getHomepage(),
    getNavigation(),
    getFooterConfig(),
    getReseauxSociaux(),
    getAppartements('?filters[statut][$eq]=disponible&populate=image_principale&sort=ordre_affichage:desc&pagination[pageSize]=10'),
    getPublicationsSociales(),
  ])

  return (
    <HomeClient
      homepage={homepage}
      navigation={navigation}
      footerConfig={footerConfig}
      reseauxSociaux={reseauxSociaux}
      appartements={appartements as never[]}
      publications={publications}
    />
  )
}

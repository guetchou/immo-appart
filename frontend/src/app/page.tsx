// Server Component — récupère les données Strapi côté serveur
import {
  getHomepage, getNavigation, getFooterConfig,
  getReseauxSociaux, getAppartements, getPublicationsSociales
} from '@/lib/strapi'
import HomeClient from './HomeClient'

// Dev  : no-store dans strapiRequest → pas de cache, toujours frais
// Prod : webhook Strapi → revalidateTag() invalide à chaque publication
export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 30

export default async function HomePage() {
  const [
    homepage, navigation, footerConfig,
    reseauxSociaux, appartements, publications
  ] = await Promise.all([
    getHomepage(),
    getNavigation(),
    getFooterConfig(),
    getReseauxSociaux(),
    getAppartements(
      '?filters[statut][$eq]=disponible&populate=image_principale&sort=ordre_affichage:desc&pagination[pageSize]=10'
    ),
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

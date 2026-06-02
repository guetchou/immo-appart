// Server Component — récupère les données Strapi côté serveur
import {
  getHomepage, getNavigation, getFooterConfig,
  getReseauxSociaux, getAppartements, getPublicationsSociales,
  getServicesPremium, getAvis,
} from '@/lib/strapi'
import HomeClient from './HomeClient'

export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 30

export default async function HomePage() {
  const [
    homepage, navigation, footerConfig,
    reseauxSociaux, appartements, publications,
    servicesPremium, avis,
  ] = await Promise.all([
    getHomepage(),
    getNavigation(),
    getFooterConfig(),
    getReseauxSociaux(),
    getAppartements(
      '?filters[statut][$eq]=disponible&populate=image_principale&sort=ordre_affichage:desc&pagination[pageSize]=10'
    ),
    getPublicationsSociales(),
    getServicesPremium(),
    getAvis(),
  ])

  return (
    <HomeClient
      homepage={homepage}
      navigation={navigation}
      footerConfig={footerConfig}
      reseauxSociaux={reseauxSociaux}
      appartements={appartements as never[]}
      publications={publications}
      servicesPremium={servicesPremium as never[]}
      avis={avis as never[]}
    />
  )
}

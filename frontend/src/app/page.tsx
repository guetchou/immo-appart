// Server Component — récupère les données Strapi côté serveur
import {
  getHomepage, getNavigation, getFooterConfig,
  getReseauxSociaux, getAppartements, getPublicationsSociales,
  getServicesPremium, getAvis, getChatConfig,
} from '@/lib/strapi'
import HomeClient from './HomeClient'

export const revalidate = 30

export default async function HomePage() {
  const [
    homepage, navigation, footerConfig,
    reseauxSociaux, appartements, publications,
    servicesPremium, avis, chatConfig,
  ] = await Promise.all([
    getHomepage(),
    getNavigation(),
    getFooterConfig(),
    getReseauxSociaux(),
    getAppartements(
      '?filters[statut][$eq]=disponible&populate[0]=image_principale&populate[1]=type_logement_ref&sort=ordre_affichage:desc&pagination[pageSize]=10'
    ),
    getPublicationsSociales(),
    getServicesPremium(),
    getAvis(),
    getChatConfig(),
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
      chatConfig={chatConfig}
    />
  )
}

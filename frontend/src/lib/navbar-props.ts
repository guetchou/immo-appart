import type { NavProps } from '@/components/layout/Navbar'
import { toStrapiPublicUrl } from '@/lib/strapi-url'

type NavLink = { label: string; href: string }

export function mapNavbarProps(navigation?: Record<string, unknown> | null): NavProps {
  const logoImageMedia = navigation?.logo_image as { url?: string } | null
  const agentPhotoMedia = navigation?.agent_photo as { url?: string } | null
  const liensNav = (navigation?.liens_nav as NavLink[] | null) ?? undefined

  return {
    logoNom: navigation?.logo_nom as string | undefined,
    logoTagline: navigation?.logo_tagline as string | undefined,
    logoImageUrl: toStrapiPublicUrl(logoImageMedia?.url) ?? undefined,
    telephone: navigation?.telephone as string | undefined,
    agentNom: navigation?.agent_nom as string | undefined,
    agentPhotoUrl:
      toStrapiPublicUrl(agentPhotoMedia?.url)
      ?? (navigation?.agent_photo_url as string | undefined),
    liensNav,
    boutonReserver: (navigation?.bouton_reserver_texte as string | undefined) ?? undefined,
  }
}

import type { FooterProps } from '@/components/layout/Footer'

type FooterColonne = { titre: string; liens: { label: string; href: string }[] }

export function mapFooterProps(
  footerConfig?: Record<string, unknown> | null,
  navigation?: Record<string, unknown> | null
): FooterProps {
  return {
    logoNom:
      (footerConfig?.logo_nom as string | undefined)
      ?? (navigation?.logo_nom as string | undefined),
    logoTagline:
      (footerConfig?.logo_tagline as string | undefined)
      ?? (navigation?.logo_tagline as string | undefined),
    description: footerConfig?.description as string | undefined,
    adresse: footerConfig?.adresse as string | undefined,
    email: footerConfig?.email as string | undefined,
    telephone:
      (footerConfig?.telephone as string | undefined)
      ?? (navigation?.telephone as string | undefined),
    copyright: footerConfig?.copyright as string | undefined,
    facebookUrl: footerConfig?.facebook_url as string | undefined,
    instagramUrl: footerConfig?.instagram_url as string | undefined,
    youtubeUrl: footerConfig?.youtube_url as string | undefined,
    whatsappUrl: footerConfig?.whatsapp_url as string | undefined,
    tiktokUrl: footerConfig?.tiktok_url as string | undefined,
    colonnesLiens: (footerConfig?.colonnes_liens as FooterColonne[] | null) ?? undefined,
  }
}

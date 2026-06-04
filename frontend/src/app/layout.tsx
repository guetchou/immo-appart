import type { Metadata } from 'next'
import { Montserrat, Plus_Jakarta_Sans } from 'next/font/google'
import PreviewBanner from '@/components/ui/PreviewBanner'
import { getSiteConfig } from '@/lib/strapi'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const DEFAULT_SITE_NAME = 'Résidence NDOMBI'
const DEFAULT_TITLE = 'Résidence NDOMBI — Appartements de luxe à Pointe-Noire'
const DEFAULT_DESCRIPTION = 'Appartements meublés haut de gamme à Foucks, Pointe-Noire. Studios, T2/T3, Penthouse et Villas. Confort · Luxe · Élégance.'
const DEFAULT_KEYWORDS = ['appartement', 'luxe', 'Pointe-Noire', 'Congo', 'location', 'résidence', 'NDOMBI']

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()
  const siteName = (site?.nom_site as string | undefined) ?? DEFAULT_SITE_NAME
  const title = (site?.titre_seo_defaut as string | undefined) ?? DEFAULT_TITLE
  const description = (site?.description_seo as string | undefined) ?? DEFAULT_DESCRIPTION
  const ogDescription = (site?.open_graph_description as string | undefined) ?? description

  return {
    title: {
      default: title,
      template: (site?.template_titre_seo as string | undefined) ?? `%s | ${siteName}`,
    },
    description,
    keywords: asStringArray(site?.mots_cles_seo, DEFAULT_KEYWORDS),
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      siteName,
      title,
      description: ogDescription,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${montserrat.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        {/* Bannière orange si mode preview actif */}
        <PreviewBanner />
        {children}
      </body>
    </html>
  )
}

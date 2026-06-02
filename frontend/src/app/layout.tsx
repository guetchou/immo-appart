import type { Metadata } from 'next'
import { Montserrat, Plus_Jakarta_Sans } from 'next/font/google'
import PreviewBanner from '@/components/ui/PreviewBanner'
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

export const metadata: Metadata = {
  title: {
    default: 'Résidence NDOMBI — Appartements de luxe à Pointe-Noire',
    template: '%s | Résidence NDOMBI',
  },
  description:
    'Appartements meublés haut de gamme à Foucks, Pointe-Noire. Studios, T2/T3, Penthouse et Villas. Confort · Luxe · Élégance.',
  keywords: ['appartement', 'luxe', 'Pointe-Noire', 'Congo', 'location', 'résidence', 'NDOMBI'],
  authors: [{ name: 'Résidence NDOMBI' }],
  creator: 'Résidence NDOMBI',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Résidence NDOMBI',
    title: 'Résidence NDOMBI — Appartements de luxe à Pointe-Noire',
    description: 'Appartements meublés haut de gamme à Pointe-Noire, République du Congo.',
  },
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

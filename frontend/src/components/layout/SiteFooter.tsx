import Footer from '@/components/layout/Footer'
import { getFooterConfig, getNavigation } from '@/lib/strapi'
import { mapFooterProps } from '@/lib/footer-props'

export default async function SiteFooter() {
  const [footerConfig, navigation] = await Promise.all([
    getFooterConfig(),
    getNavigation(),
  ])

  return <Footer {...mapFooterProps(footerConfig, navigation)} />
}

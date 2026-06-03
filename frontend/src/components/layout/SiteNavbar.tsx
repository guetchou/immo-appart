import Navbar from '@/components/layout/Navbar'
import { getNavigation } from '@/lib/strapi'
import { mapNavbarProps } from '@/lib/navbar-props'

export default async function SiteNavbar() {
  const navigation = await getNavigation()
  return <Navbar {...mapNavbarProps(navigation)} />
}

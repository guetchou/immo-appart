import { NextRequest, NextResponse } from 'next/server'

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN  = process.env.STRAPI_API_TOKEN ?? ''

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ data: [] })

  const params = new URLSearchParams({
    'filters[email_client][$eq]':  email,
    'sort':                        'createdAt:desc',
    'pagination[pageSize]':        '20',
    'populate[appartement][fields][0]': 'titre',
    'populate[appartement][fields][1]': 'slug',
    'populate[appartement][fields][2]': 'quartier',
    'populate[appartement][populate][image_principale][fields][0]': 'url',
  })

  const res = await fetch(`${STRAPI}/api/reservations?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: 'no-store',
  })

  if (!res.ok) return NextResponse.json({ data: [] })
  const data = await res.json()
  return NextResponse.json({ data: data.data ?? [] })
}

import { NextRequest, NextResponse } from 'next/server'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Autoriser Strapi Admin à embarquer le frontend en iframe (Preview)
  response.headers.set(
    'Content-Security-Policy',
    `frame-ancestors 'self' ${STRAPI_URL} http://localhost:1337`
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

import { NextResponse } from 'next/server'
import { getAuthEspaceConfig } from '@/lib/strapi'

export async function GET() {
  const config = await getAuthEspaceConfig()
  return NextResponse.json({ data: config ?? {} })
}

import { NextRequest, NextResponse } from 'next/server'

// Legacy endpoint — DB-based token claiming is deprecated
// All tokens are now on-chain only via nad.fun DEX
export async function POST() {
  return NextResponse.json({ 
    error: 'Token claiming is deprecated. Buy TCG on nad.fun DEX.',
    dex: 'https://nad.fun/token/0x94CF69B5b13E621cB11f5153724AFb58c7337777',
  }, { status: 410 })
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Token claiming is deprecated. Buy TCG on nad.fun DEX.',
    dex: 'https://nad.fun/token/0x94CF69B5b13E621cB11f5153724AFb58c7337777',
  }, { status: 410 })
}

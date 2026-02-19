import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/turso'

const rarityColors: Record<string, string> = {
  common: '#6b7280',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
}

// GET /api/metadata/[tokenId] — ERC-721 metadata JSON
export async function GET(req: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params

  try {
    const result = await execute(
      `SELECT card_name, rarity, grade, pack_type FROM card_pulls WHERE nft_token_id = ?`,
      [tokenId]
    )

    if (!result.rows?.length) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 })
    }

    const card = result.rows[0]
    const name = card.card_name as string
    const rarity = card.rarity as string
    const grade = Number(card.grade)
    const packType = card.pack_type as string
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    return NextResponse.json({
      name: `${name} (PSA ${grade})`,
      description: `A ${rarity} TCG Arena card — ${name}. PSA Grade: ${grade}. Pulled from a ${packType} pack.`,
      image: `https://tcgarena.fun/cards/${slug}.jpg`,
      external_url: `https://tcgarena.fun/collection`,
      attributes: [
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'PSA Grade', value: grade },
        { trait_type: 'Pack Type', value: packType },
        { display_type: 'number', trait_type: 'Grade', value: grade },
      ],
      background_color: (rarityColors[rarity] || '#111111').replace('#', ''),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}

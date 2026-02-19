import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const rarityColors: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#a855f7',
  legendary: '#f59e0b',
}

// Minimal card data for OG images
const CARDS: Record<string, { cost: number; power: number; toughness: number; type: string; rarity: string; flavor: string }> = {
  'nadzilla': { cost: 9, power: 8, toughness: 7, type: 'Creature — Dragon/Kaiju', rarity: 'legendary', flavor: 'The first block was its footstep. The second was everything else.' },
  'rugpull-dragon': { cost: 7, power: 6, toughness: 5, type: 'Creature — Dragon', rarity: 'rare', flavor: 'It pumps before it dumps. Every time.' },
  'frozen-liquidity': { cost: 8, power: 7, toughness: 6, type: 'Creature — Dragon', rarity: 'legendary', flavor: "Your funds aren't lost. They're just... unavailable." },
  'rug-walker': { cost: 9, power: 8, toughness: 4, type: 'Creature — Eldritch', rarity: 'legendary', flavor: 'It walks between projects. None of them survive.' },
  'dead-cat-bounce': { cost: 10, power: 7, toughness: 7, type: 'Creature — Phoenix', rarity: 'legendary', flavor: 'It always comes back. But never as high.' },
  'whale': { cost: 8, power: 6, toughness: 9, type: 'Creature — Leviathan', rarity: 'legendary', flavor: 'The ocean moves when it moves.' },
  'shard-wyrm': { cost: 8, power: 7, toughness: 5, type: 'Creature — Dragon/Serpent', rarity: 'legendary', flavor: 'Each scale is a shard. Each shard is a world.' },
}

export async function GET(request: NextRequest, { params }: { params: { cardName: string } }) {
  const cardName = params.cardName
  const slug = cardName.toLowerCase().replace(/\s+/g, '-')
  const card = CARDS[slug]

  const displayName = cardName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const rarity = card?.rarity || 'common'
  const rarityColor = rarityColors[rarity] || '#9ca3af'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0f0a, #1a2a1a, #0a0f0a)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Border glow */}
        <div style={{ position: 'absolute', inset: '8px', border: `2px solid ${rarityColor}`, borderRadius: '16px', display: 'flex' }} />

        {/* TCG Arena branding */}
        <div style={{ position: 'absolute', top: '24px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#b8f53d', fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.2em' }}>⚔️ TCG ARENA</span>
        </div>

        {/* Rarity badge */}
        <div style={{
          position: 'absolute', top: '24px', right: '32px',
          color: rarityColor, fontSize: '14px', fontWeight: 'bold',
          textTransform: 'uppercase', letterSpacing: '0.15em',
          display: 'flex',
        }}>
          {rarity}
        </div>

        {/* Card name */}
        <div style={{ color: 'white', fontSize: '56px', fontWeight: 'bold', marginBottom: '12px', display: 'flex' }}>
          {displayName}
        </div>

        {/* Type */}
        <div style={{ color: '#9ca3af', fontSize: '20px', marginBottom: '24px', display: 'flex' }}>
          {card?.type || 'Creature'}
        </div>

        {/* Stats */}
        {card && (
          <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: rarityColor, fontSize: '36px', fontWeight: 'bold' }}>{card.cost}</span>
              <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Cost</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#ef4444', fontSize: '36px', fontWeight: 'bold' }}>{card.power}</span>
              <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Power</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: '#3b82f6', fontSize: '36px', fontWeight: 'bold' }}>{card.toughness}</span>
              <span style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>Toughness</span>
            </div>
          </div>
        )}

        {/* Flavor */}
        {card?.flavor && (
          <div style={{ color: '#6b7280', fontSize: '18px', fontStyle: 'italic', maxWidth: '600px', textAlign: 'center', display: 'flex' }}>
            &ldquo;{card.flavor}&rdquo;
          </div>
        )}

        {/* Season tag */}
        <div style={{ position: 'absolute', bottom: '24px', display: 'flex', color: '#4b5563', fontSize: '12px', letterSpacing: '0.2em' }}>
          SEASON 01: THE CONVERGENCE
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

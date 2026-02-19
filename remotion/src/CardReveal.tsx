import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion'
import { COLORS, RARITY_GLOW, easeOutBack } from './theme'

type Props = {
  cardName: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  power: number
  toughness: number
  cost: number
  ability: string
  imageUrl: string
}

const RarityParticle: React.FC<{ color: string; delay: number; angle: number; distance: number }> = ({ color, delay, angle, distance }) => {
  const frame = useCurrentFrame()
  const t = Math.max(0, frame - delay)
  const rad = (angle + t * 0.5) * (Math.PI / 180)
  const d = distance + Math.sin(t * 0.05) * 20
  const x = 540 + Math.cos(rad) * d
  const y = 540 + Math.sin(rad) * d
  const opacity = interpolate(t, [0, 15, 120, 150], [0, 0.8, 0.8, 0], { extrapolateRight: 'clamp' })
  const size = 4 + Math.sin(t * 0.1) * 2

  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      backgroundColor: color, opacity,
      boxShadow: `0 0 12px ${color}`,
    }} />
  )
}

export const CardReveal: React.FC<Props> = ({ cardName, rarity, power, toughness, cost, ability, imageUrl }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const rarityColor = COLORS[rarity] || COLORS.common

  // Phase 1: Pack glow (0-60)
  const packGlow = interpolate(frame, [0, 30, 55, 60], [0, 0.8, 1, 0], { extrapolateRight: 'clamp' })
  
  // Phase 2: Card flip (60-120)
  const flipProgress = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rotateY = interpolate(flipProgress, [0, 0.5, 1], [180, 90, 0])
  const cardScale = spring({ frame: Math.max(0, frame - 60), fps, config: { damping: 10, stiffness: 80 } })
  
  // Phase 3: Rarity burst (90-180)
  const burstOpacity = interpolate(frame, [85, 95, 150, 180], [0, 1, 0.6, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (360 / 24) * i,
    distance: 200 + Math.random() * 100,
    delay: 85 + i * 2,
  }))

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background radial pulse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${rarityColor}${Math.round(burstOpacity * 25).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
      }} />

      {/* Rarity particles */}
      {frame > 85 && particles.map((p, i) => (
        <RarityParticle key={i} color={rarityColor} {...p} />
      ))}

      {/* Pack glow phase */}
      {frame < 65 && (
        <div style={{
          width: 280, height: 400, borderRadius: 20,
          backgroundColor: '#111',
          border: `2px solid ${rarityColor}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 ${packGlow * 80}px ${rarityColor}`,
        }}>
          <div style={{ fontSize: 80, opacity: 0.5 + packGlow * 0.5 }}>🎴</div>
        </div>
      )}

      {/* Card */}
      {frame >= 60 && (
        <div style={{
          width: 320, padding: 0,
          transform: `scale(${cardScale * 1.5}) rotateY(${rotateY}deg)`,
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}>
          <div style={{
            backgroundColor: '#111',
            border: `3px solid ${rarityColor}`,
            borderRadius: 16,
            padding: 20,
            boxShadow: RARITY_GLOW[rarity] || 'none',
          }}>
            {/* Cost */}
            <div style={{
              position: 'absolute', top: -10, left: -10,
              width: 50, height: 50, borderRadius: '50%',
              backgroundColor: '#1a5fb4', border: '3px solid #3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 900, color: COLORS.white,
              zIndex: 10,
            }}>
              {cost}
            </div>

            {/* Card art */}
            <div style={{
              width: '100%', height: 280, borderRadius: 8,
              backgroundColor: `${rarityColor}15`,
              border: `1px solid ${rarityColor}30`,
              overflow: 'hidden',
              marginBottom: 16,
            }}>
              {imageUrl ? (
                <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>🐉</div>
              )}
            </div>

            {/* Name */}
            <div style={{
              fontSize: 22, fontWeight: 900, color: COLORS.white,
              textAlign: 'center', marginBottom: 4,
            }}>
              {cardName}
            </div>

            {/* Rarity badge */}
            <div style={{
              textAlign: 'center', marginBottom: 12,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: rarityColor, textTransform: 'uppercase',
                letterSpacing: '2px',
                backgroundColor: `${rarityColor}15`,
                padding: '4px 12px', borderRadius: 20,
              }}>
                {rarity}
              </span>
            </div>

            {/* Ability */}
            <div style={{
              textAlign: 'center', fontSize: 13,
              color: COLORS.accent, fontWeight: 600,
              marginBottom: 12,
            }}>
              ✨ {ability}
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 16px',
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#ef4444' }}>⚔ {power}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>🛡 {toughness}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rarity text reveal */}
      {frame > 100 && (
        <div style={{
          position: 'absolute', bottom: 120,
          fontSize: 48, fontWeight: 900,
          color: rarityColor, textTransform: 'uppercase',
          letterSpacing: '6px',
          opacity: interpolate(frame, [100, 115, 160, 180], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          textShadow: `0 0 40px ${rarityColor}`,
        }}>
          {rarity}
        </div>
      )}
    </AbsoluteFill>
  )
}

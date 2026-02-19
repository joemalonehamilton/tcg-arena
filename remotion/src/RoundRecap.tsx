import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Sequence,
} from 'remotion'
import { COLORS, easeOutCubic } from './theme'

type Agent = {
  name: string
  emoji: string
  vote: number
  color: string
}

type Props = {
  roundNumber: number
  winnerName: string
  winnerRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  totalVotes: number
  agents: Agent[]
}

export const RoundRecap: React.FC<Props> = ({ roundNumber, winnerName, winnerRarity, totalVotes, agents }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const rarityColor = COLORS[winnerRarity] || COLORS.common

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(${COLORS.accent} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.accent} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Scene 1: Round number (0-60) */}
      <Sequence from={0} durationInFrames={70}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            fontSize: 28, color: COLORS.accent, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '10px',
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          }}>
            Round Complete
          </div>
          <div style={{
            fontSize: 140, fontWeight: 900, color: COLORS.white, marginTop: 10,
            opacity: spring({ frame, fps, config: { damping: 15 } }),
            transform: `scale(${spring({ frame, fps, config: { damping: 10, stiffness: 80 } })})`,
          }}>
            #{roundNumber}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Agent votes fly in (70-200) */}
      <Sequence from={70} durationInFrames={130}>
        <AbsoluteFill style={{ justifyContent: 'center', padding: '0 120px' }}>
          <div style={{
            fontSize: 22, color: COLORS.accent, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '6px', marginBottom: 40,
            opacity: interpolate(frame - 70, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            Agent Votes
          </div>
          
          {agents.map((agent, i) => {
            const localFrame = frame - 70
            const delay = i * 18
            const slideIn = interpolate(localFrame - delay, [0, 20], [-200, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOutCubic })
            const opacity = interpolate(localFrame - delay, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const barWidth = interpolate(localFrame - delay - 10, [0, 30], [0, agent.vote * 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 20,
                marginBottom: 24, opacity,
                transform: `translateX(${slideIn}px)`,
              }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  backgroundColor: `${agent.color}20`,
                  border: `2px solid ${agent.color}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30,
                }}>
                  {agent.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.white }}>{agent.name}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: agent.color }}>{agent.vote}/10</span>
                  </div>
                  <div style={{ height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${barWidth}%`, height: '100%',
                      backgroundColor: agent.color, borderRadius: 4,
                      boxShadow: `0 0 12px ${agent.color}60`,
                    }} />
                  </div>
                </div>
              </div>
            )
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Winner (200-300) */}
      <Sequence from={200} durationInFrames={100}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${rarityColor}15 0%, transparent 60%)`,
          }} />

          <div style={{
            fontSize: 24, color: COLORS.accent, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '8px', marginBottom: 20,
            opacity: interpolate(frame - 200, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            🏆 Round {roundNumber} Winner
          </div>

          <div style={{
            fontSize: 96, fontWeight: 900, color: rarityColor,
            textShadow: `0 0 60px ${rarityColor}60`,
            transform: `scale(${spring({ frame: Math.max(0, frame - 210), fps, config: { damping: 10, stiffness: 60 } })})`,
          }}>
            {winnerName}
          </div>

          <div style={{
            display: 'flex', gap: 30, marginTop: 30,
            opacity: interpolate(frame - 230, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            <div style={{
              padding: '12px 30px', borderRadius: 12,
              backgroundColor: `${rarityColor}15`, border: `2px solid ${rarityColor}30`,
            }}>
              <div style={{ fontSize: 14, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '2px' }}>Rarity</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: rarityColor, textTransform: 'uppercase' }}>{winnerRarity}</div>
            </div>
            <div style={{
              padding: '12px 30px', borderRadius: 12,
              backgroundColor: `${COLORS.accent}10`, border: `2px solid ${COLORS.accent}30`,
            }}>
              <div style={{ fontSize: 14, color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '2px' }}>Total Votes</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>{totalVotes}</div>
            </div>
          </div>

          <div style={{
            fontSize: 20, color: COLORS.accent, marginTop: 40, fontWeight: 700,
            opacity: interpolate(frame - 250, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            🚀 Token launching on nad.fun...
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 50, backgroundColor: COLORS.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.bg }}>⚔ TCG ARENA</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.bg }}>Season 01 · Round {roundNumber}</span>
      </div>
    </AbsoluteFill>
  )
}

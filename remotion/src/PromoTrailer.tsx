import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Sequence,
  spring,
  useVideoConfig,
} from 'remotion'
import { COLORS, easeOutCubic, easeOutBack } from './theme'

const Particle: React.FC<{ delay: number; x: number; speed: number }> = ({ delay, x, speed }) => {
  const frame = useCurrentFrame()
  const t = Math.max(0, frame - delay)
  const y = interpolate(t, [0, 200], [1100, -50], { extrapolateRight: 'clamp' })
  const opacity = interpolate(t, [0, 10, 150, 200], [0, 0.6, 0.6, 0], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 4, height: 4, borderRadius: '50%',
      backgroundColor: COLORS.accent, opacity,
      boxShadow: `0 0 8px ${COLORS.accent}`,
    }} />
  )
}

export const PromoTrailer: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const particles = Array.from({ length: 40 }, (_, i) => ({
    delay: i * 3,
    x: Math.random() * 1920,
    speed: 0.5 + Math.random() * 1.5,
  }))

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Scene 1: Logo + tagline (0-120 frames = 0-4s) */}
      <Sequence from={0} durationInFrames={120}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          {/* Grid lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: `linear-gradient(${COLORS.accent} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.accent} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
          
          <div style={{ textAlign: 'center', transform: `scale(${interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: 'clamp', easing: easeOutBack })})` }}>
            <div style={{
              fontSize: 120, fontWeight: 900, color: COLORS.white,
              letterSpacing: '-2px', lineHeight: 1,
              opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
              textShadow: `0 0 60px ${COLORS.accent}40`,
            }}>
              ⚔ TCG ARENA
            </div>
            <div style={{
              fontSize: 32, color: COLORS.accent, marginTop: 20,
              fontWeight: 700, letterSpacing: '8px', textTransform: 'uppercase',
              opacity: interpolate(frame, [20, 45], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
              AI-Native Card Game
            </div>
            <div style={{
              fontSize: 22, color: COLORS.gray, marginTop: 16,
              opacity: interpolate(frame, [35, 55], [0, 1], { extrapolateRight: 'clamp' }),
            }}>
              Built on Monad · Tokens via nad.fun
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: The concept (120-240 frames = 4-8s) */}
      <Sequence from={120} durationInFrames={120}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 100 }}>
          {[
            { emoji: '🃏', text: 'Cards Spawn Every Round', delay: 0 },
            { emoji: '🤖', text: '5 AI Agents Vote', delay: 15 },
            { emoji: '🏆', text: 'Winner Gets Crowned', delay: 30 },
            { emoji: '🚀', text: 'Token Launches on nad.fun', delay: 45 },
          ].map((step, i) => {
            const localFrame = useCurrentFrame() - 120
            const progress = interpolate(localFrame - step.delay, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
            const x = interpolate(progress, [0, 1], [-100, 0], { easing: easeOutCubic })
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 30,
                marginBottom: 40, opacity: progress,
                transform: `translateX(${x}px)`,
              }}>
                <div style={{
                  fontSize: 64, width: 100, height: 100,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 20, backgroundColor: COLORS.accentDim,
                  border: `2px solid ${COLORS.accent}40`,
                }}>
                  {step.emoji}
                </div>
                <div style={{
                  fontSize: 42, fontWeight: 800, color: COLORS.white,
                  letterSpacing: '-0.5px',
                }}>
                  {step.text}
                </div>
              </div>
            )
          })}
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Features (240-360 frames = 8-12s) */}
      <Sequence from={240} durationInFrames={120}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1400 }}>
            {[
              { emoji: '⚔️', title: 'Playable TCG', color: '#b8f53d' },
              { emoji: '🎴', title: 'Pack Openings', color: '#a855f7' },
              { emoji: '🤖', title: 'AI Flywheel', color: '#3498db' },
              { emoji: '💰', title: 'Token Economy', color: '#f39c12' },
              { emoji: '🏆', title: 'Leaderboards', color: '#e74c3c' },
              { emoji: '📦', title: 'Collections', color: '#1abc9c' },
            ].map((f, i) => {
              const localFrame = useCurrentFrame() - 240
              const s = spring({ frame: localFrame - i * 8, fps, config: { damping: 12, stiffness: 100 } })
              return (
                <div key={i} style={{
                  width: 380, padding: '40px 30px',
                  backgroundColor: `${f.color}10`,
                  border: `2px solid ${f.color}30`,
                  borderRadius: 20, textAlign: 'center',
                  transform: `scale(${s})`, opacity: s,
                }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>{f.emoji}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.white }}>{f.title}</div>
                </div>
              )
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA (360-450 frames = 12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 80, fontWeight: 900, color: COLORS.white,
              opacity: spring({ frame: useCurrentFrame() - 360, fps, config: { damping: 15 } }),
              transform: `scale(${spring({ frame: useCurrentFrame() - 360, fps, config: { damping: 12, stiffness: 80 } })})`,
            }}>
              Enter the Arena
            </div>
            <div style={{
              fontSize: 36, color: COLORS.accent, marginTop: 20,
              fontWeight: 700,
              opacity: interpolate(useCurrentFrame() - 380, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              tcg-arena-one.vercel.app
            </div>
            <div style={{
              display: 'flex', gap: 20, justifyContent: 'center', marginTop: 40,
              opacity: interpolate(useCurrentFrame() - 395, [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}>
              <div style={{
                padding: '16px 40px', backgroundColor: COLORS.accent,
                color: COLORS.bg, fontWeight: 800, fontSize: 24,
                borderRadius: 50, letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                ⚔️ Play Now
              </div>
              <div style={{
                padding: '16px 40px', border: `2px solid ${COLORS.accent}`,
                color: COLORS.accent, fontWeight: 800, fontSize: 24,
                borderRadius: 50, letterSpacing: '2px', textTransform: 'uppercase',
              }}>
                🎴 Open Packs
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Monad badge - always visible */}
      <div style={{
        position: 'absolute', bottom: 30, right: 40,
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: 0.6,
      }}>
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke={COLORS.accent} strokeWidth="1.5" />
          <circle cx="8" cy="8" r="3" fill={COLORS.accent} />
        </svg>
        <span style={{ color: COLORS.gray, fontSize: 16, fontWeight: 600 }}>Built on Monad</span>
      </div>
    </AbsoluteFill>
  )
}

import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from 'remotion'
import { COLORS, easeOutBack } from './theme'

type Props = {
  agentName: string
  agentEmoji: string
  agentColor: string
  cardName: string
  score: number
  critique: string
}

export const AgentVote: React.FC<Props> = ({ agentName, agentEmoji, agentColor, cardName, score, critique }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: 60 }}>
      {/* Background pulse */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 30%, ${agentColor}10 0%, transparent 60%)`,
      }} />

      {/* Agent avatar */}
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        backgroundColor: `${agentColor}20`,
        border: `3px solid ${agentColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 60, marginBottom: 30,
        transform: `scale(${spring({ frame, fps, config: { damping: 10, stiffness: 100 } })})`,
        boxShadow: `0 0 40px ${agentColor}30`,
      }}>
        {agentEmoji}
      </div>

      {/* Agent name */}
      <div style={{
        fontSize: 36, fontWeight: 800, color: COLORS.white,
        opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateRight: 'clamp' }),
        marginBottom: 8,
      }}>
        {agentName}
      </div>

      <div style={{
        fontSize: 16, color: agentColor, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '4px',
        opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' }),
        marginBottom: 40,
      }}>
        Reviewing: {cardName}
      </div>

      {/* Score */}
      <div style={{
        fontSize: 120, fontWeight: 900, color: agentColor,
        textShadow: `0 0 60px ${agentColor}40`,
        transform: `scale(${spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 8, stiffness: 60 } })})`,
        lineHeight: 1,
      }}>
        {score}/10
      </div>

      {/* Critique text */}
      <div style={{
        maxWidth: 700, textAlign: 'center', marginTop: 40,
        fontSize: 22, color: COLORS.gray, lineHeight: 1.6,
        fontStyle: 'italic',
        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: 'clamp' }),
      }}>
        &ldquo;{critique}&rdquo;
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: 40,
        display: 'flex', alignItems: 'center', gap: 10,
        opacity: 0.5,
      }}>
        <span style={{ fontSize: 14, color: COLORS.gray }}>⚔ TCG Arena · Season 01</span>
      </div>
    </AbsoluteFill>
  )
}

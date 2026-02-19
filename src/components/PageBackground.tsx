'use client'

/**
 * Premium page background — gives each page a unique atmospheric feel.
 * Each variant has layered gradients, glows, and optional thematic elements.
 */

type Variant = 'arena' | 'play' | 'packs' | 'collection' | 'agents' | 'decks' | 'forge' | 'leaderboard' | 'submit' | 'default'

const configs: Record<Variant, {
  gradients: string[]
  orbs: Array<{ color: string; size: string; x: string; y: string; blur: string; opacity: number }>
  gridColor?: string
  vignetteStrength?: number
}> = {
  arena: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(184,245,61,0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse at 0% 50%, rgba(124,58,237,0.05) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#b8f53d', size: '500px', x: '10%', y: '20%', blur: '150px', opacity: 0.04 },
      { color: '#a855f7', size: '400px', x: '80%', y: '60%', blur: '120px', opacity: 0.03 },
      { color: '#b8f53d', size: '300px', x: '60%', y: '10%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(184,245,61,0.03)',
  },
  play: {
    gradients: [
      'radial-gradient(ellipse at 50% 30%, rgba(239,68,68,0.06) 0%, transparent 50%)',
      'radial-gradient(ellipse at 50% 80%, rgba(184,245,61,0.05) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#ef4444', size: '600px', x: '50%', y: '30%', blur: '180px', opacity: 0.04 },
      { color: '#b8f53d', size: '400px', x: '20%', y: '70%', blur: '120px', opacity: 0.03 },
      { color: '#f59e0b', size: '350px', x: '80%', y: '20%', blur: '140px', opacity: 0.02 },
    ],
    gridColor: 'rgba(239,68,68,0.02)',
    vignetteStrength: 0.6,
  },
  packs: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse at 30% 70%, rgba(184,245,61,0.05) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#a855f7', size: '500px', x: '50%', y: '15%', blur: '160px', opacity: 0.05 },
      { color: '#b8f53d', size: '400px', x: '20%', y: '60%', blur: '120px', opacity: 0.03 },
      { color: '#3b82f6', size: '350px', x: '75%', y: '80%', blur: '130px', opacity: 0.03 },
    ],
    gridColor: 'rgba(168,85,247,0.025)',
  },
  collection: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 50%)',
      'radial-gradient(ellipse at 80% 60%, rgba(184,245,61,0.04) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#f59e0b', size: '500px', x: '30%', y: '20%', blur: '150px', opacity: 0.04 },
      { color: '#b8f53d', size: '350px', x: '70%', y: '50%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(245,158,11,0.02)',
  },
  agents: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.07) 0%, transparent 50%)',
      'radial-gradient(ellipse at 20% 80%, rgba(168,85,247,0.05) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#3b82f6', size: '500px', x: '40%', y: '10%', blur: '150px', opacity: 0.04 },
      { color: '#a855f7', size: '400px', x: '60%', y: '60%', blur: '120px', opacity: 0.03 },
      { color: '#1abc9c', size: '300px', x: '10%', y: '40%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(59,130,246,0.025)',
  },
  decks: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 50%)',
      'radial-gradient(ellipse at 70% 70%, rgba(184,245,61,0.04) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#22c55e', size: '500px', x: '50%', y: '20%', blur: '150px', opacity: 0.04 },
      { color: '#b8f53d', size: '350px', x: '20%', y: '70%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(34,197,94,0.02)',
  },
  forge: {
    gradients: [
      'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.07) 0%, transparent 50%)',
      'radial-gradient(ellipse at 30% 80%, rgba(239,68,68,0.04) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#f97316', size: '500px', x: '50%', y: '25%', blur: '160px', opacity: 0.05 },
      { color: '#ef4444', size: '400px', x: '70%', y: '60%', blur: '120px', opacity: 0.03 },
      { color: '#f59e0b', size: '300px', x: '20%', y: '50%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(249,115,22,0.025)',
  },
  leaderboard: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse at 80% 40%, rgba(184,245,61,0.04) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#f59e0b', size: '500px', x: '50%', y: '10%', blur: '150px', opacity: 0.05 },
      { color: '#b8f53d', size: '400px', x: '30%', y: '50%', blur: '120px', opacity: 0.03 },
    ],
    gridColor: 'rgba(245,158,11,0.025)',
  },
  submit: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(184,245,61,0.06) 0%, transparent 50%)',
      'radial-gradient(ellipse at 60% 60%, rgba(59,130,246,0.04) 0%, transparent 40%)',
    ],
    orbs: [
      { color: '#b8f53d', size: '500px', x: '40%', y: '15%', blur: '150px', opacity: 0.04 },
      { color: '#3b82f6', size: '350px', x: '70%', y: '50%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(184,245,61,0.025)',
  },
  default: {
    gradients: [
      'radial-gradient(ellipse at 50% 0%, rgba(184,245,61,0.06) 0%, transparent 50%)',
    ],
    orbs: [
      { color: '#b8f53d', size: '400px', x: '50%', y: '20%', blur: '140px', opacity: 0.04 },
      { color: '#a855f7', size: '300px', x: '70%', y: '60%', blur: '100px', opacity: 0.03 },
    ],
    gridColor: 'rgba(184,245,61,0.02)',
  },
}

export default function PageBackground({ variant = 'default' }: { variant?: Variant }) {
  const config = configs[variant] || configs.default
  const vignette = config.vignetteStrength ?? 0.4

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Grid overlay */}
      {config.gridColor && (
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${config.gridColor} 1px, transparent 1px), linear-gradient(90deg, ${config.gridColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      )}

      {/* Gradient layers */}
      {config.gradients.map((g, i) => (
        <div key={i} className="absolute inset-0" style={{ background: g }} />
      ))}

      {/* Floating orbs */}
      {config.orbs.map((orb, i) => (
        <div key={i} className="absolute rounded-full animate-glow-pulse" style={{
          backgroundColor: orb.color,
          width: orb.size,
          height: orb.size,
          left: orb.x,
          top: orb.y,
          filter: `blur(${orb.blur})`,
          opacity: orb.opacity,
          transform: 'translate(-50%, -50%)',
        }} />
      ))}

      {/* Edge vignette */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,8,5,${vignette}) 100%)`,
      }} />

      {/* Top fade (so content reads clearly) */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#050805]/80 to-transparent" />
    </div>
  )
}

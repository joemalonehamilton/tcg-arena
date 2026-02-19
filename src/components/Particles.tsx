'use client'

export default function Particles() {
  // Green energy particles
  const greenParticles = Array.from({ length: 25 }, (_, i) => ({
    id: `g${i}`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 12}s`,
    size: `${1.5 + Math.random() * 3}px`,
    opacity: 0.1 + Math.random() * 0.3,
    color: '#b8f53d',
  }))

  // Purple accent particles
  const purpleParticles = Array.from({ length: 10 }, (_, i) => ({
    id: `p${i}`,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${10 + Math.random() * 15}s`,
    size: `${1 + Math.random() * 2}px`,
    opacity: 0.08 + Math.random() * 0.15,
    color: '#a855f7',
  }))

  // Large slow orbs
  const orbs = Array.from({ length: 5 }, (_, i) => ({
    id: `o${i}`,
    left: `${10 + Math.random() * 80}%`,
    delay: `${Math.random() * 8}s`,
    duration: `${15 + Math.random() * 10}s`,
    size: `${4 + Math.random() * 4}px`,
    opacity: 0.05 + Math.random() * 0.1,
    color: '#b8f53d',
  }))

  const allParticles = [...greenParticles, ...purpleParticles, ...orbs]

  return (
    <>
      {/* Ambient glow layer */}
      <div className="ambient-glow" />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {allParticles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float-up"
            style={{
              left: p.left,
              bottom: '-10px',
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              opacity: p.opacity,
              animationDelay: p.delay,
              animationDuration: p.duration,
              filter: p.id.startsWith('o') ? 'blur(2px)' : 'none',
            }}
          />
        ))}
      </div>
    </>
  )
}

/**
 * Web Audio API sound effects — no external assets needed
 * Generates all sounds procedurally
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

function playNoise(duration: number, volume = 0.1) {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const source = ctx.createBufferSource()
    source.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  } catch {}
}

export const SFX = {
  // Card played from hand
  playCard() {
    playTone(400, 0.1, 'sine', 0.12)
    setTimeout(() => playTone(600, 0.15, 'sine', 0.1), 50)
  },

  // Attack declared
  attack() {
    playTone(200, 0.15, 'sawtooth', 0.08)
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.1), 80)
    setTimeout(() => playNoise(0.1, 0.06), 100)
  },

  // Creature dies
  death() {
    playTone(300, 0.3, 'square', 0.08)
    setTimeout(() => playTone(150, 0.4, 'square', 0.06), 100)
    playNoise(0.2, 0.05)
  },

  // Damage dealt to face
  damage() {
    playNoise(0.15, 0.1)
    playTone(100, 0.2, 'sawtooth', 0.1)
  },

  // Card drawn
  draw() {
    playTone(800, 0.08, 'sine', 0.06)
    setTimeout(() => playTone(1000, 0.08, 'sine', 0.05), 40)
  },

  // Turn start
  turnStart() {
    playTone(523, 0.1, 'sine', 0.08)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.08), 80)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 160)
  },

  // Victory fanfare — triumphant ascending arpeggio with harmony
  victory() {
    // Main melody
    const melody = [523, 659, 784, 1047, 1318]
    melody.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.4, 'sine', 0.12), i * 140)
    })
    // Harmony layer (thirds)
    setTimeout(() => {
      const harmony = [659, 784, 1047, 1318, 1568]
      harmony.forEach((n, i) => {
        setTimeout(() => playTone(n, 0.3, 'sine', 0.06), i * 140)
      })
    }, 70)
    // Final chord stab
    setTimeout(() => {
      playTone(1047, 0.6, 'sine', 0.1)
      playTone(1318, 0.6, 'sine', 0.08)
      playTone(1568, 0.6, 'sine', 0.06)
    }, 800)
  },

  // Defeat — descending doom + rumble
  defeat() {
    playTone(400, 0.3, 'sawtooth', 0.06)
    setTimeout(() => playTone(300, 0.4, 'sawtooth', 0.07), 180)
    setTimeout(() => playTone(200, 0.5, 'sawtooth', 0.08), 360)
    setTimeout(() => playTone(100, 0.8, 'sawtooth', 0.06), 540)
    // Low rumble
    setTimeout(() => playTone(50, 1.0, 'sawtooth', 0.04), 600)
    setTimeout(() => playNoise(0.4, 0.03), 700)
  },

  // Token earned jingle
  tokenEarn() {
    playTone(880, 0.1, 'sine', 0.08)
    setTimeout(() => playTone(1100, 0.1, 'sine', 0.08), 80)
    setTimeout(() => playTone(1320, 0.15, 'sine', 0.1), 160)
  },

  // Ability used
  ability() {
    playTone(600, 0.1, 'triangle', 0.1)
    setTimeout(() => playTone(900, 0.15, 'triangle', 0.08), 60)
    setTimeout(() => playTone(1200, 0.1, 'triangle', 0.06), 120)
  },

  // Pack opening — building suspense
  packShake() {
    playNoise(0.05, 0.04)
    playTone(200 + Math.random() * 100, 0.1, 'sine', 0.05)
  },

  // Pack reveal
  packOpen() {
    playNoise(0.2, 0.08)
    const notes = [400, 500, 600, 800, 1000]
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.2, 'sine', 0.1), i * 50)
    })
  },

  // Rare+ card reveal
  rareReveal() {
    setTimeout(() => playTone(523, 0.2, 'sine', 0.15), 0)
    setTimeout(() => playTone(659, 0.2, 'sine', 0.15), 150)
    setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 300)
    setTimeout(() => playTone(1047, 0.4, 'sine', 0.2), 450)
    setTimeout(() => playTone(1318, 0.5, 'sine', 0.15), 600)
  },

  // Legendary reveal (epic fanfare)
  legendaryReveal() {
    playNoise(0.3, 0.06)
    const notes = [261, 329, 392, 523, 659, 784, 1047]
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.4, 'sine', 0.12 + i * 0.01), i * 120)
    })
  },

  // Button click
  click() {
    playTone(700, 0.05, 'sine', 0.06)
  },

  // Block assigned
  block() {
    playTone(300, 0.1, 'square', 0.08)
    setTimeout(() => playTone(400, 0.15, 'square', 0.06), 60)
  },

  // Mana spend
  mana() {
    playTone(1200, 0.08, 'sine', 0.04)
  },
}

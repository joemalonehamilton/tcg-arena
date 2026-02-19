import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0a0f0a',
          card: '#0d120d',
          border: '#1a2a1a',
          accent: '#b8f53d',
          gold: '#f59e0b',
          common: '#9ca3af',
          uncommon: '#22c55e',
          rare: '#3b82f6',
          legendary: '#f59e0b',
          mythic: '#ff0040',
          muted: '#6b7280',
        },
      },
      animation: {
        'card-enter': 'cardEnter 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'ticker': 'ticker 30s linear infinite',
        'legendary-glow': 'legendaryGlow 3s ease-in-out infinite',
        'mythic-glow': 'mythicGlow 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'float-up': 'floatUp 1s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out',
        'attack-slam': 'attackSlam 0.5s ease-out',
        'death-explode': 'deathExplode 0.5s ease-out forwards',
        'turn-flash': 'turnFlash 1.2s ease-out forwards',
        'card-shimmer': 'cardShimmer 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-border': 'pulseBorder 1.5s ease-in-out infinite',
      },
      keyframes: {
        cardEnter: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.6)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        legendaryGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,158,11,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(245,158,11,0.6), 0 0 50px rgba(245,158,11,0.2)' },
        },
        mythicGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255,0,64,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255,0,64,0.7), 0 0 80px rgba(255,0,64,0.3), 0 0 120px rgba(255,107,0,0.15)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 200%' },
          '100%': { backgroundPosition: '-200% -200%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-60px) scale(0.5)', opacity: '0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scale(1.5)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.9)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        attackSlam: {
          '0%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-20px) scale(1.1)' },
          '70%': { transform: 'translateY(5px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        deathExplode: {
          '0%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.5', transform: 'scale(1.3) rotate(5deg)' },
          '100%': { opacity: '0', transform: 'scale(0.3) rotate(-10deg)' },
        },
        turnFlash: {
          '0%': { opacity: '0', transform: 'scale(2)' },
          '30%': { opacity: '1', transform: 'scale(1)' },
          '70%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },
        cardShimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(40px)' },
          '50%': { transform: 'scale(1.05) translateY(-5px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(184,245,61,0.3)' },
          '50%': { borderColor: 'rgba(184,245,61,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

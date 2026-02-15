import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          'orange-dark': '#EA580C',
          green: '#22C55E',
          gold: '#EAB308',
          red: '#EF4444',
        },
        dark: {
          bg: '#0A0A0A',
          card: '#141414',
          border: '#1E1E1E',
          text: '#A0A0A0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: '375px',
      },
      animation: {
        'xp-gain': 'xpGain 0.5s ease-out',
        'level-up': 'levelUp 0.8s ease-out',
        'badge-earned': 'badgeEarned 0.6s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        xpGain: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.8', color: '#EAB308' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        levelUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        badgeEarned: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

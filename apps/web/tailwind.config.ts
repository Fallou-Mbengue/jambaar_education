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
        landing: {
          blue: '#001C4A',
          'blue-light': '#002D6B',
          'blue-muted': '#0A2E5C',
          yellow: '#FFD100',
          orange: '#FF7A00',
          'orange-hover': '#E56E00',
          green: '#28A745',
        },
        dark: {
          bg: '#E5E7EB',
          card: '#F9FAFB',
          border: '#D1D5DB',
          text: '#4B5563',
          'card-hover': '#F3F4F6',
        },
        surface: {
          1: '#F9FAFB',
          2: '#F3F4F6',
          3: '#E5E7EB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      spacing: {
        'sidebar': '240px',
        'sidebar-compact': '64px',
        'panel': '320px',
        'topbar': '56px',
      },
      width: {
        'sidebar': '240px',
        'sidebar-compact': '64px',
        'panel': '320px',
      },
      maxWidth: {
        'feed-item': '480px',
        'content-area': '860px',
      },
      animation: {
        'xp-gain': 'xpGain 0.5s ease-out',
        'level-up': 'levelUp 0.8s ease-out',
        'badge-earned': 'badgeEarned 0.6s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'slide-in-right': 'slideInRight 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'panel-open': 'panelOpen 0.2s ease-out',
        'fade-up': 'fadeUp 0.7s ease-out forwards',
        'fade-up-delay-1': 'fadeUp 0.7s 0.1s ease-out forwards',
        'fade-up-delay-2': 'fadeUp 0.7s 0.2s ease-out forwards',
        'fade-up-delay-3': 'fadeUp 0.7s 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s 2s ease-in-out infinite',
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
        slideInRight: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        panelOpen: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5)',
        'modal': '0 20px 60px rgba(0,0,0,0.7)',
        'panel': '-4px 0 20px rgba(0,0,0,0.3)',
        'sidebar': '4px 0 20px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
        'badge': '6px',
      },
      fontSize: {
        'label': ['11px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};

export default config;

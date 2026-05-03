/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        surface: {
          950: '#04070d',
          900: '#080e18',
          800: '#0d1520',
          700: '#131d2c',
          600: '#1a2638',
          500: '#243249',
        },
        ink: {
          primary: '#e2e8f4',
          secondary: '#8899b4',
          muted: '#4d6080',
          faint: '#2a3d58',
        },
        accent: '#3b7afc',
        'accent-dim': 'rgba(59,122,252,0.12)',
        wire: 'rgba(255,255,255,0.06)',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 0 0 1px rgba(59,122,252,0.3), 0 8px 32px rgba(0,0,0,0.5)',
        glow: '0 0 20px rgba(59,122,252,0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
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

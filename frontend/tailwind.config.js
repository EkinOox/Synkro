/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      },
      boxShadow: {
        'soft': '0 4px 18px -2px rgba(0,0,0,0.08)',
        'soft-lg': '0 10px 28px -4px rgba(0,0,0,0.15)',
        'brand': '0 6px 24px -2px rgba(59,130,246,0.4)',
        'brand-lg': '0 10px 36px -4px rgba(59,130,246,0.55)',
        'danger': '0 6px 24px -2px rgba(244,63,94,0.45)',
        'danger-lg': '0 10px 36px -4px rgba(244,63,94,0.55)',
        'glass': '0 4px 24px -1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.1)',
        'glass-lg': '0 8px 40px -2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        'float-slow': 'float 14s ease-in-out infinite',
        'float-delay': 'float 18s ease-in-out infinite',
        'fade-in-up': 'fadeInUp .6s cubic-bezier(.16,.8,.24,1) forwards'
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-18px) translateX(12px)' },
          '50%': { transform: 'translateY(6px) translateX(-8px)' },
          '75%': { transform: 'translateY(-12px) translateX(4px)' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(22px) scale(.98)' },
          '60%': { opacity: '1', transform: 'translateY(-2px) scale(1.005)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      }
    },
  },
  plugins: [],
}

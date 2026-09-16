/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#58CC02',
          'lime-dark': '#46A302',
          'lime-glow': '#7FE030',
          blue: '#1CB0F6',
          'blue-dark': '#1899D6',
          red: '#FF4B4B',
          gold: '#FFC800',
          purple: '#CE82FF',
          orange: '#FF9600',
        },
        ink: {
          900: '#0F0F0F',
          800: '#171717',
          700: '#1F1F1F',
          600: '#2A2A2A',
          500: '#3A3A3A',
        },
      },
      fontFamily: {
        display: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'btn-lime': '0 4px 0 0 #46A302',
        'btn-blue': '0 4px 0 0 #1899D6',
        'btn-red': '0 4px 0 0 #C43333',
        'btn-gray': '0 4px 0 0 #3A3A3A',
        glow: '0 0 24px rgba(88,204,2,0.35)',
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        shake: 'shake 0.4s ease-in-out',
        pop: 'pop 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        confetti: 'confetti 1s ease-out forwards',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
};

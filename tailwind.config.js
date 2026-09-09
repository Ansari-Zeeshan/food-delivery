/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#F3F1F0',
          dark: '#111111',
          red: '#C93632',
          tomato: '#E24B42',
          surface: '#E8E5E3',
          'surface-light': '#FAF9F8',
          muted: '#73706D',
          border: '#D8D4D1',
          green: '#2E7D32',
          'green-light': '#E8F5E9',
          amber: '#D97706',
          'amber-light': '#FEF3C7',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(17, 17, 17, 0.05)',
        'soft-md': '0 8px 24px -4px rgba(17, 17, 17, 0.08)',
        'soft-lg': '0 16px 40px -6px rgba(17, 17, 17, 0.12)',
        'card-hover': '0 12px 32px -4px rgba(201, 54, 50, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      }
    },
  },
  plugins: [],
}

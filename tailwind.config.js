/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#E50914',
        'primary-dark': '#B20710',
        background: '#0A0A0A',
        card: '#1A1A2E',
        'card-hover': '#252540',
        accent: '#FFD700',
        'accent-dark': '#D4B000',
        surface: '#141428',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

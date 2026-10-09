/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbe6',
          100: '#fff3b3',
          200: '#ffe680',
          300: '#ffd84d',
          400: '#ffca1a',
          500: '#e6b200', // Gold/Amber accent
          600: '#b88e00',
          700: '#8a6b00',
          800: '#5c4700',
          900: '#2e2400',
        },
        slate: {
          850: '#151e2e',
          950: '#0b0f17',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Amiri', 'Tajawal', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

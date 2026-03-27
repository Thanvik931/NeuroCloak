/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          sidebar: '#0F172A',
          bg: '#1E293B',
          card: '#1E293B',
          border: '#334155'
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}

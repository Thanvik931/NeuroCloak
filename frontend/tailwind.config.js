/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          sidebar: '#0c1324',
          bg: '#070d1f',
          card: '#151b2d',
          border: '#23293c'
        },
        primary: {
          DEFAULT: '#4edea3',
          hover: '#38c98e',
          container: '#10b981',
          fixed: '#6ffbbe',
        },
        secondary: {
          DEFAULT: '#4cd7f6',
          container: '#03b5d3',
          fixed: '#acedff',
        },
        surface: {
          DEFAULT: '#0c1324',
          dim: '#0c1324',
          container: '#191f31',
          'container-lowest': '#070d1f',
          'container-low': '#151b2d',
          'container-high': '#23293c',
          'container-highest': '#2e3447',
          variant: '#2e3447',
        },
        'on-surface': '#dce1fb',
        'on-surface-variant': '#bbcabf',
        'outline-variant': '#3c4a42',
        outline: '#86948a',
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}

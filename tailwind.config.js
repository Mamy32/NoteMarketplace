/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#211C45', 90: '#2F2A57', 70: '#5B5680', 50: '#8A86A6', 20: '#D9D7E5', 10: '#ECEBF2' },
        paper: { DEFAULT: '#FAF8F2', 2: '#F3F0E6', 3: '#E9E5D7' },
        coral: { DEFAULT: '#FF735C', dark: '#C23A24', soft: '#FFE3DD' },
        mint: { DEFAULT: '#3DBE9A', dark: '#16694F', soft: '#DDF4EC' },
        sun: { DEFAULT: '#F6C65B', soft: '#FCEFC9' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(33,28,69,.06), 0 6px 18px -8px rgba(33,28,69,.18)',
        lift: '0 2px 0 rgba(33,28,69,.08), 0 18px 30px -14px rgba(33,28,69,.32)',
        stamp: '3px 3px 0 #211C45',
      },
    },
  },
  plugins: [],
};

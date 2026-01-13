/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tbwa-yellow': '#FFDE00',
        'tbwa-darkYellow': '#E6C700',
        'tbwa-black': '#000000',
        'tbwa-white': '#FFFFFF',
        'scout-card': '#FFFFFF',
        'scout-border': '#E5E7EB',
        'scout-text': '#111827',
        'scout-bg': '#F9FAFB',
        'scout-primary': 'rgb(30 64 175)',
        'scout-secondary': 'rgb(59 130 246)',
        'scout-accent': 'rgb(96 165 250)',
        'scout-dark': 'rgb(15 23 42)',
        'scout-light': 'rgb(248 250 252)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

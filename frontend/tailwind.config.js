/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-card': '#1e293b',
        'surface-border': '#334155',
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        risk: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#10b981',
        }
      },
    },
  },
  plugins: [],
}

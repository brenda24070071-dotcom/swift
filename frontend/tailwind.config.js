/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        primary: { DEFAULT: '#3b82f6', dark: '#1d4ed8', light: '#60a5fa' },
        accent:  { DEFAULT: '#f97316', dark: '#ea580c' },
        brand: {
          dark: '#0f172a',
          card: '#1e293b',
          purple: '#8b5cf6',
          indigo: '#6366f1',
          pink: '#ec4899',
        }
      },
      boxShadow: {
        'premium': '0 8px 30px rgb(0 0 0 / 0.04)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.15)',
      }
    },
  },
  plugins: [],
};

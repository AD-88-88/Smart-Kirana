/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette straight from the SmartKirana PRD design system
        primary: { DEFAULT: '#1E3A8A', light: '#3B82F6' },
        surface: '#F8FAFC',
        cta: { DEFAULT: '#F97316', hover: '#EA580C' },
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        ink: { DEFAULT: '#1F2937', muted: '#6B7280' },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
    },
  },
  plugins: [],
};

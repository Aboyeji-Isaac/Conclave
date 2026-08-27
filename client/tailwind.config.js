/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8fa',
        ink: '#15171c',
        muted: '#68707d',
        line: '#e1e3e8',
        brand: '#5146e5',
        'brand-soft': '#f0efff',
        success: '#1aa251',
        warning: '#d77a08',
      },
      boxShadow: { panel: '0 1px 2px rgba(20, 23, 31, 0.04)' },
      borderRadius: { panel: '12px' },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8fa',
        ink: '#111827',
        muted: '#6b7280',
        line: '#e5e7eb',
        brand: '#4f46e5',
        'brand-soft': '#eef2ff',
        success: '#16a34a',
        warning: '#d97706',
      },
      boxShadow: { panel: '0 1px 2px rgba(20, 23, 31, 0.04)' },
      borderRadius: { panel: '12px' },
      spacing: { 'shell-sidebar': '248px', 'shell-topbar': '76px' },
    },
  },
  plugins: [],
};

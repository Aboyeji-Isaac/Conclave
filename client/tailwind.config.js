/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: { md: '768px' },
    extend: {
      // Values sourced from the Penpot "Conclave-Foundations" token set.
      colors: {
        canvas: '#f7f8fa', // Color.Background
        surface: '#ffffff', // Color.Surface
        ink: '#111827', // Color.Text.Primary
        muted: '#6b7280', // Color.Text.Secondary
        line: '#e5e7eb', // Color.Border
        brand: '#4f46e5', // Color.Primary
        'brand-soft': '#eef2ff', // not a Foundations token; retained until components are reworked
        success: '#16a34a', // Color.Success
        warning: '#d97706', // Color.Warning
        error: '#dc2626', // Color.Error
      },
      fontFamily: {
        // Typography.FontFamily.InterTight
        sans: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        // Typography.FontSize.* with the unitless 1.2 line height (Typography.LineHeight.Default)
        // and Typography.FontWeight.* carried per style.
        h1: ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['16px', { lineHeight: '1.2', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.2', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.2', fontWeight: '500' }],
        metadata: ['12px', { lineHeight: '1.2', fontWeight: '400' }],
      },
      spacing: {
        // Spacing.4/8/12/16/20/24/28/32/48 already match Tailwind's default 1/2/3/4/5/6/7/8/12 steps.
        18: '18px', // Spacing.18
      },
      boxShadow: {
        // Elevation.Header and Elevation.SidebarEdge are transparent in the design (no shadow).
        modal: '0 12px 28px 0 rgba(17, 24, 39, 0.14)', // Elevation.Modal
      },
      // Radius.8 -> rounded-lg, Radius.12 -> rounded-xl, Border.Width.1 -> border (Tailwind defaults).
    },
  },
  plugins: [],
};

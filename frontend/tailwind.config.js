/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            code: { backgroundColor: theme('colors.gray.100'), padding: '0.2em 0.4em', borderRadius: '0.25em', fontWeight: 'normal' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: '#1e293b', color: '#e2e8f0', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto' },
            'pre code': { backgroundColor: 'transparent', padding: 0 },
            h1: { fontWeight: '700', marginTop: '2rem', marginBottom: '1rem' },
            h2: { fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' },
            h3: { fontWeight: '600', marginTop: '1.25rem', marginBottom: '0.5rem' },
            'h1,h2,h3,h4': { scrollMarginTop: '5rem' },
          },
        },
      }),
    },
  },
  plugins: [],
};

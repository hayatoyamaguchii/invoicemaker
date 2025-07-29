/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'custom-primary': '#1a202c',
      'custom-secondary': '#2d3748',
      'custom-accent': '#38a169',
      'custom-white': '#ffffff',
      'custom-gray': {
        '100': '#f7fafc',
        '200': '#edf2f7',
        '300': '#e2e8f0',
        '400': '#cbd5e0',
        '500': '#a0aec0',
        '600': '#718096',
        '700': '#4a5568',
        '800': '#2d3748',
        '900': '#1a202c',
      },
    }
  },
  plugins: [],
}

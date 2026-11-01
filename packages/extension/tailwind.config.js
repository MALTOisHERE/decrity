/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f8',
          100: '#e6f1f2',
          500: '#2f6f78',
          600: '#295f67',
          700: '#1d4c54',
        },
      },
    },
  },
  plugins: [],
}

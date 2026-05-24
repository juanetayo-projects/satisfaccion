/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f1fb',
          100: '#c5d9f5',
          200: '#9dbfee',
          300: '#72a4e7',
          400: '#4f90e2',
          500: '#2c7bdd',
          600: '#1B4F8A',
          700: '#154074',
          800: '#0f305d',
          900: '#091f3f',
        },
        secondary: {
          400: '#38c6e8',
          500: '#00B4D8',
          600: '#0096b7',
        },
        accent: '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

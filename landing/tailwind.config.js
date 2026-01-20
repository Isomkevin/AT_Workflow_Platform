/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Africa's Talking Brand Colors
        primary: {
          50: '#e6f2fb',
          100: '#cce5f7',
          200: '#99cbef',
          300: '#66b1e7',
          400: '#3397df',
          500: '#126DBF', // Main brand blue
          600: '#0e5a9f',
          700: '#0b477f',
          800: '#0B3B6A', // Dark navy accent
          900: '#072a4d',
        },
        accent: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

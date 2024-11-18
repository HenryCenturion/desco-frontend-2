/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        btnSingIn: '#FFC43D',
        btnSingInHover: 'rgba(255, 196, 61, 0.8)',
      },
      screens: {
        'custom-lg': '1028px',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}


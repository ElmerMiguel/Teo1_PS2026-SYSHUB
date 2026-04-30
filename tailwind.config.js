/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563EB',
          dark: '#1F2937'
        },
        bg: {
          light: '#F3F4F6'
        }
      }
    },
  },
  plugins: [],
}

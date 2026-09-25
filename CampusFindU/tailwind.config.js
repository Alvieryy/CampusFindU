/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MMSU Official Brand Colors
        'mmsu-green': '#0A4222', 
        'mmsu-gold': '#F5B013',
        'mmsu-light-green': '#146C3A',
      },
    },
  },
  plugins: [],
}
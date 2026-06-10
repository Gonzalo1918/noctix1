/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        zinc: {
          850: '#1d1d21',
          950: '#09090b',
        },
        violet: {
          650: '#6d28d9',
        }
      }
    },
  },
  plugins: [],
}

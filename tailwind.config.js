/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', 
    theme: {
      extend: {
        colors: {
          gkGreen: '#58CC02',
          gkRed: '#FF4B4B',
          gkYellow: '#FFC800',
        },
      },
    },
    plugins: [],
  }
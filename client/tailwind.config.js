/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        navy: '#14213D',
        accent: '#FCA311',
        lightgray: '#E5E5E5',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
};

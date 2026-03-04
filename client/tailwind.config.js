/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  important: true, // <-- ADD THIS to override MUI styles
  theme: {
    extend: {},
  },
  plugins: [],
};

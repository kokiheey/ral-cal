/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        secondary: '#151312',
        light:{
          100: '#d0d2d9',
          200: '#A8B5DB',
          300: '#9CA4AB',
        },
        dark:{
          100: '#08070f',
          200: '#0f0d23',
        },
        accent: '#ffffff'
      }
    },
  },
  plugins: [],
}
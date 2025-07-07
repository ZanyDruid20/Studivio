// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // Or whatever file types you're using for components
  ],
  theme: {
    extend: {
      // Your custom theme extensions
    },
  },
  plugins: [
    // Any Tailwind plugins you want to use
  ],
};
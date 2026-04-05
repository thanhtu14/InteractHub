/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // Đưa mã màu trực tiếp vào đây, không dùng var() nữa
        background: "#333",
        logocolor: "#376dc5",
        textcolor: "#38363b",
        whitecolor: "#ffffff",
        greencolor: "#42b72a",
        blackcolor: "#000000",
        texttitlecolor: "#ffffff",
        greenboldcolor: "#00a400",
        backgroundPostColor: "#252728",
        backgroundCommentDark: "#333334",
        backgroundCommentLight: "#f0f2f5",
        hovercolor: "#d0d7dd",
      },
      screens: {
        'tablet': { 'max': '1024px' },
        'mobile': { 'max': '600px' },
      },
      boxShadow: {
        'modal': '0px 4px 10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
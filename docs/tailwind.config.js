/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light: {
          primary: "#546AD4",
          background: "#F0EFFF",
          "main-background": "#FFFFFF",
        },
        dark: {
          primary: "#4757AE",
          background: "#1D1D35",
          "main-background": "#0D0C10",
        },
      },
    },
  },
  plugins: [],
};

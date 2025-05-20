/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/ui/**/*.{html,tsx,jsx,astro}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6E35F7",
        },
        black: "#000000",
        gray: "#626164",
        border: "#d9d9d9",
        background: "#F7F7F7",
        "surface-secondary": "#F5F7FA",
        "border-secondary": "#E7E8EE",
        secondary: "#474D62",
        white: "#FFFFFF",
      },
      fontSize: {
        gigantic: "22px",
        title: "16px",
        normal: "14px",
        small: "12px",
      },
      textShadow: {
        sm: "0 0 2px var(--tw-shadow-color)",
        DEFAULT: "0 0 4px var(--tw-shadow-color)",
        lg: "0 0 16px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

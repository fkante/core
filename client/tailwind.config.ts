import typography from "@tailwindcss/typography";
import scrollbarHide from "tailwind-scrollbar-hide";
import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
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
  plugins: [
    typography,
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") }
      );
    }),
    plugin(function ({ addVariant }) {
      addVariant("loading", ["&.htmx-request", ".htmx-request &"]);
    }),
    scrollbarHide,
  ],
};
export default config;

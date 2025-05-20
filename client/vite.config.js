import { defineConfig } from "vite";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteReact({
    babel: {
      plugins: [[
        "babel-plugin-react-compiler",
      ]]
    }
  }), tailwindcss()],
  define: {
    // Make process.env available in client-side code we need it for NextAuth
    "process.env": {},
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});

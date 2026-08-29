import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@lib": resolve(__dirname, "lib"),
    },
  },
  server: {
    open: "/compare/earbuds",
  },
});

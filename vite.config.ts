import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@ref": resolve(__dirname, "reference"),
    },
  },
  server: {
    open: "/compare/earbuds",
  },
});

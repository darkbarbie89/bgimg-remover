import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // normal app entry (main index.html)
        main: path.resolve(__dirname, "index.html"),

        // embed entry (the lightweight widget page in /public)
        embed: path.resolve(__dirname, "public/embed.html"),
      },
      output: {
        // make the embed bundle predictable
        entryFileNames: (chunk) => {
          if (chunk.name === "embed") return "embed.js";
          return "[name].js";
        },
      },
    },
  },
});

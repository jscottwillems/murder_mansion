import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // GitHub Pages project sites are served from a subpath; relative build assets
  // keep the generated dist working whether it is hosted at / or /<repo>/.
  base: command === "build" ? "./" : "/",
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
}));

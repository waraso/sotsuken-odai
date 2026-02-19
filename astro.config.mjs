import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel({
    nodeVersion: "20.x",
  }),
  integrations: [tailwind()],
  vite: {
    ssr: {
      noExternal: ["kuroshiro", "kuroshiro-analyzer-kuromoji"],
      external: ["kuromoji"],
    },
  },
});

import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "hybrid",
  adapter: cloudflare(),
  site: "https://waraso.github.io",
  base: "/sotsuken-odai",
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        path: "path-browserify",
      },
    },
    optimizeDeps: {
      include: ["kuroshiro", "kuroshiro-analyzer-kuromoji"],
    },
    plugins: [
      {
        name: "no-gzip-dict-files",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Prevent automatic gzip encoding for .dat.gz files
            // Kuromoji expects to receive the gzipped files as-is and decompress them itself
            if (req.url && req.url.match(/\.dat\.gz$/)) {
              const originalSetHeader = res.setHeader.bind(res);
              res.setHeader = function (name, value) {
                if (name.toLowerCase() === "content-encoding") {
                  // Skip setting content-encoding header for dict files
                  return this;
                }
                return originalSetHeader(name, value);
              };
            }
            next();
          });
        },
      },
    ],
  },
});

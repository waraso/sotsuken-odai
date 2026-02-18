import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        'path': 'path-browserify'
      }
    },
    optimizeDeps: {
      include: ['kuroshiro', 'kuroshiro-analyzer-kuromoji']
    },
    server: {
      // Disable gzip compression for static files
      middlewareMode: false,
    },
    plugins: [{
      name: 'no-gzip-dict-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Remove gzip encoding for .dat.gz files
          if (req.url && req.url.match(/\.dat\.gz$/)) {
            const _setHeader = res.setHeader.bind(res);
            res.setHeader = (name, value) => {
              if (name.toLowerCase() === 'content-encoding') {
                return res;
              }
              return _setHeader(name, value);
            };
          }
          next();
        });
      }
    }]
  }
});

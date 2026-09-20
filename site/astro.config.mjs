// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tina from '@tinacms/astro/integration';
import node from '@astrojs/node';

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const isPreview = process.env.TINA_PREVIEW === 'true';

const previewEndpoints = () => ({
  name: 'tina-preview-endpoints',
  hooks: {
    // @ts-ignore
    'astro:config:setup': ({ injectRoute, addMiddleware, updateConfig }) => {
      addMiddleware({
        order: 'pre',
        entrypoint: fileURLToPath(new URL('./src/lib/tina/preview-middleware.ts', import.meta.url)),
      });
      injectRoute({
        pattern: '/robots.txt',
        entrypoint: './src/lib/tina/preview-robots.ts',
        prerender: false,
      });
      injectRoute({
        pattern: '/tina-island/[name]',
        entrypoint: './src/lib/tina/island-endpoint.ts',
        prerender: false,
      });
      injectRoute({
        pattern: '/admin',
        entrypoint: './src/lib/tina/admin-redirect.ts',
        prerender: false,
      });
      injectRoute({
        pattern: '/admin/index.html/~',
        entrypoint: './src/lib/tina/admin-redirect.ts',
        prerender: false,
      });
      updateConfig({
        vite: {
          plugins: [
            {
              name: 'preview-robots-dev-middleware',
              configureServer(server) {
                server.middlewares.use((req, res, next) => {
                  const url = req.url || '';
                  if (url.startsWith('/admin')) {
                    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
                  }
                  if (url === '/robots.txt') {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
                    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
                    res.end('User-agent: *\nDisallow: /\n');
                    return;
                  }
                  if (
                    url === '/sitemap-index.xml' ||
                    url === '/sitemap.xml' ||
                    url === '/sitemap-0.xml'
                  ) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
                    res.end('Not Found');
                    return;
                  }
                  next();
                });
              },
            },
          ],
        },
      });
    },
    // @ts-ignore
    'astro:build:done': async ({ dir }) => {
      const previewRobots = 'User-agent: *\nDisallow: /\n';
      const targets = [
        new URL('robots.txt', dir),
        new URL('client/robots.txt', dir),
      ];
      for (const target of targets) {
        if (fs.existsSync(target)) {
          fs.writeFileSync(target, previewRobots, 'utf-8');
        }
      }
    },
  },
});

export default defineConfig({
  site: 'https://evergreenconsulting.co', // ponytail: update once the real domain is chosen
  integrations: [
    ...(isPreview ? [tina(), previewEndpoints()] : [sitemap()]),
  ],
  ...(isPreview ? {
    adapter: node({ mode: 'standalone' }),
  } : {}),
});

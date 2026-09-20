// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tina from '@tinacms/astro/integration';
import node from '@astrojs/node';

const isPreview = process.env.TINA_PREVIEW === 'true';

const previewEndpoints = () => ({
  name: 'tina-preview-endpoints',
  hooks: {
    // @ts-ignore
    'astro:config:setup': ({ injectRoute }) => {
      injectRoute({
        pattern: '/tina-island/[name]',
        entrypoint: './src/lib/tina/island-endpoint.ts',
        prerender: false,
      });
    },
  },
});

export default defineConfig({
  site: 'https://evergreenconsulting.co', // ponytail: update once the real domain is chosen
  integrations: [
    sitemap(),
    ...(isPreview ? [tina(), previewEndpoints()] : []),
  ],
  ...(isPreview ? {
    adapter: node({ mode: 'standalone' }),
  } : {}),
});

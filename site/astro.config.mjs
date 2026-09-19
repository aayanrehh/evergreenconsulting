// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://evergreenconsulting.co', // ponytail: update once the real domain is chosen
  integrations: [sitemap()],
});

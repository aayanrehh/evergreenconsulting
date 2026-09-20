import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const routeDirectory = path.dirname(fileURLToPath(import.meta.url));
  const adminHtml = fs.readFileSync(path.resolve(routeDirectory, '../admin-index.html'), 'utf-8');

  return new Response(adminHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};

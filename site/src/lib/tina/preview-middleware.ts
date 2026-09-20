import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Intercept /robots.txt in preview mode to guarantee disallowing all crawling
  if (pathname === '/robots.txt') {
    return new Response('User-agent: *\nDisallow: /\n', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  // Intercept sitemap requests on preview domain
  if (
    pathname === '/sitemap-index.xml' ||
    pathname === '/sitemap-0.xml' ||
    pathname === '/sitemap.xml'
  ) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
      },
    });
  }

  // Exclude island dynamic endpoints, Tina internal/API endpoints, and binary/static assets
  if (
    pathname.startsWith('/tina-island/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_astro/') ||
    pathname.match(/\.(jpe?g|png|webp|svg|gif|ico|woff2?|ttf|eot|pdf|docx?|css|js|map)$/i)
  ) {
    return next();
  }

  const response = await next();

  // Apply X-Robots-Tag to HTML pages, text responses, and page redirects
  const contentType = response.headers.get('content-type') || '';
  if (
    contentType.includes('text/html') ||
    contentType.includes('text/plain') ||
    response.status === 301 ||
    response.status === 302
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  }

  return response;
});

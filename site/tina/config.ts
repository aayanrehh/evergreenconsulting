import { defineConfig } from 'tinacms';
import { BlogCollectionManager } from './components/BlogCollectionManager';

// Route the admin editor cleanly to collection document forms so that singleton
// page fields and blog posts are directly editable in the static production admin,
// without triggering visual preview on pages that do not carry TinaIsland bridges.
if (typeof window !== 'undefined') {
  const isPreviewMode = (): boolean => {
    const search = window.location.search || '';
    if (search.includes('preview=false')) return false;
    if (search.includes('preview=true')) return true;
    if (typeof (window as any).__TINA_PREVIEW__ === 'boolean') {
      return (window as any).__TINA_PREVIEW__;
    }
    const host = window.location.hostname || '';
    if (host.startsWith('preview.') || host.includes('preview')) {
      return true;
    }
    if (typeof process !== 'undefined' && process.env?.TINA_PREVIEW === 'true') {
      return true;
    }
    return false;
  };

  const singletonDocMap: Record<string, string> = {
    front: 'home',
    about: 'about',
    services: 'services',
    resources: 'resources',
    contact: 'contact',
    results: 'results',
    blog: 'blog',
    reviews: 'reviews',
  };

  const collectionToPreviewRoute: Record<string, string> = {
    front: '',
    about: 'about/',
    services: 'services/',
    resources: 'resources/',
    contact: 'contact/',
    results: 'results/',
    blog: 'blog/',
    reviews: '',
  };

  const previewRouteToEditPath: Record<string, string> = {
    '': 'front/home',
    '/': 'front/home',
    about: 'about/about',
    'about/': 'about/about',
    services: 'services/services',
    'services/': 'services/services',
    resources: 'resources/resources',
    'resources/': 'resources/resources',
    contact: 'contact/contact',
    'contact/': 'contact/contact',
    results: 'results/results',
    'results/': 'results/results',
    blog: 'blog/blog',
    'blog/': 'blog/blog',
    reviews: 'reviews/reviews',
    'reviews/': 'reviews/reviews',
  };

  const handleAdminRouting = () => {
    const rawHash = window.location.hash || '';
    const hash = rawHash.replace(/^#\/?/, '');
    const isPreview = isPreviewMode();

    if (isPreview) {
      // PREVIEW MODE: Live side-by-side visual preview editor
      // 1. Root or empty hash -> default to home visual preview #/~/
      if (!hash || hash === '/' || hash === '~' || hash === '~/' || hash === '/~') {
        if (rawHash !== '#/~/') {
          window.location.replace(window.location.pathname + window.location.search + '#/~/');
        }
        return;
      }

      // 2. Visual preview route #/~/... -> preserve and keep side-by-side preview active
      if (hash.startsWith('~/') || hash === '~') {
        return;
      }

      // 3. Post collection edit: #/collections/edit/post/:slug -> open post in visual preview
      const postEditMatch = hash.match(/^collections\/edit\/post\/(.+)$/);
      if (postEditMatch) {
        const slug = postEditMatch[1].replace(/^\/|\/$/g, '');
        window.location.replace(window.location.pathname + window.location.search + `#/~/blog/${slug}/`);
        return;
      }

      // 4. Post collection list: #/collections/post or #/collections/post/~ -> open blog index preview
      if (/^collections\/post(\/|(\/~.*))?$/.test(hash)) {
        window.location.replace(window.location.pathname + window.location.search + '#/~/blog/');
        return;
      }

      // 5. Singleton collections list or edit: #/collections/:name or #/collections/edit/:name/*
      const collectionMatch = hash.match(/^collections(?:\/edit)?\/([^\/~]+)/);
      if (collectionMatch) {
        const colName = collectionMatch[1];
        if (colName in collectionToPreviewRoute) {
          const routePath = collectionToPreviewRoute[colName];
          window.location.replace(window.location.pathname + window.location.search + `#/~/` + routePath);
          return;
        }
      }
    } else {
      // PRODUCTION MODE: Standard Tina form editing (no visual preview iframe)
      // 1. Root or empty hash or default preview route -> default to front page editor
      if (!hash || hash === '~' || hash === '~/' || hash === '/' || hash === '/~') {
        if (rawHash !== '#/collections/edit/front/home') {
          window.location.replace(window.location.pathname + window.location.search + '#/collections/edit/front/home');
        }
        return;
      }

      // 2. Visual preview routes #/~/... -> map to corresponding collection form editor
      if (hash.startsWith('~/') || hash === '~') {
        const sub = hash.replace(/^~\/?/, '');
        const blogMatch = sub.match(/^blog\/(.+?)\/?$/);
        if (blogMatch) {
          window.location.replace(window.location.pathname + window.location.search + `#/collections/edit/post/${blogMatch[1]}`);
          return;
        }
        if (sub in previewRouteToEditPath) {
          window.location.replace(window.location.pathname + window.location.search + `#/collections/edit/${previewRouteToEditPath[sub]}`);
          return;
        }
        if (sub.includes('reviews')) {
          window.location.replace(window.location.pathname + window.location.search + '#/collections/edit/reviews/reviews');
          return;
        }
        window.location.replace(window.location.pathname + window.location.search + '#/collections/edit/front/home');
        return;
      }

      // 3. Singleton collection list routes: #/collections/:name or #/collections/:name/~
      const singletonListMatch = hash.match(/^collections\/([^\/~]+)(?:\/~?)?$/);
      if (singletonListMatch) {
        const colName = singletonListMatch[1];
        if (colName in singletonDocMap) {
          const docName = singletonDocMap[colName];
          window.location.replace(window.location.pathname + window.location.search + `#/collections/edit/${colName}/${docName}`);
          return;
        }
      }
    }
  };

  handleAdminRouting();
  window.addEventListener('hashchange', handleAdminRouting);
}

// Editing happens at /admin. Locally: `npm run dev`. In production the same URL works once
// TINA_CLIENT_ID / TINA_TOKEN from app.tina.io are set on the host.
export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main',
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: '', publicFolder: 'public' } },
  cmsCallback: (cms) => {
    cms.fields.add({
      name: 'blog-posts-manager',
      Component: BlogCollectionManager,
    });
    return cms;
  },
  schema: {
    collections: [
      {
        name: 'front',
        label: 'Front Page',
        path: 'src/data',
        match: { include: 'home' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/',
        },
        fields: [
          { type: 'string', name: 'titlePrefix', label: 'Hero Headline (Prefix)' },
          { type: 'string', name: 'strikeText', label: 'Hero Strikethrough Word' },
          { type: 'string', name: 'insertText', label: 'Hero Replacement Word (Green)' },
          { type: 'string', name: 'heroLede', label: 'Hero Subtitle / Description', ui: { component: 'textarea' } },
          { type: 'string', name: 'primaryCtaText', label: 'Hero Primary Button Text' },
          { type: 'string', name: 'primaryCtaHref', label: 'Hero Primary Button Link' },
          { type: 'string', name: 'secondaryCtaText', label: 'Hero Secondary Button Text' },
          { type: 'string', name: 'secondaryCtaHref', label: 'Hero Secondary Button Link' },
          { type: 'image', name: 'heroPhoto', label: 'Hero Photo' },
          { type: 'string', name: 'heroPhotoCaption', label: 'Hero Photo Caption' },
          {
            type: 'object', name: 'facts', label: 'Key Stats / Facts Banner', list: true,
            ui: { itemProps: (item) => ({ label: `${item?.number || ''} ${item?.label || ''}`.trim() || 'Stat' }) },
            fields: [
              { type: 'string', name: 'number', label: 'Number / Stat', required: true },
              { type: 'string', name: 'label', label: 'Label / Description', required: true },
            ],
          },
          { type: 'string', name: 'bandHeading', label: 'Results Band Heading' },
          { type: 'string', name: 'bandLede', label: 'Results Band Lede' },
          { type: 'string', name: 'bandCtaText', label: 'Results Band Button Text' },
          { type: 'string', name: 'bandCtaHref', label: 'Results Band Button Link' },
          { type: 'string', name: 'howHeading', label: 'How Andrea Works: Heading' },
          { type: 'image', name: 'howPhoto', label: 'How Andrea Works: Photo' },
          { type: 'string', name: 'howPhotoCaption', label: 'How Andrea Works: Photo Caption' },
          { type: 'string', name: 'howLede', label: 'How Andrea Works: Lede', ui: { component: 'textarea' } },
          { type: 'string', name: 'howParagraphs', label: 'How Andrea Works: Paragraphs', list: true, ui: { component: 'textarea' } },
          {
            type: 'object', name: 'steps', label: 'How Andrea Works: 4 Process Steps', list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Step' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Step Title', required: true },
              { type: 'string', name: 'description', label: 'Step Description', required: true, ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object', name: 'promises', label: 'How Andrea Works: 4 Guarantees', list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Guarantee' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Guarantee Title', required: true },
              { type: 'string', name: 'text', label: 'Guarantee Text', required: true, ui: { component: 'textarea' } },
            ],
          },
          { type: 'string', name: 'howMoreText', label: 'How Andrea Works: Link Text' },
          { type: 'string', name: 'howMoreHref', label: 'How Andrea Works: Link Target' },
          { type: 'string', name: 'packagesHeading', label: 'Packages Section Heading' },
          { type: 'string', name: 'packagesMuted', label: 'Packages Section Subtitle' },
          { type: 'string', name: 'packagesCtaText', label: 'Packages Section Button Text' },
          { type: 'string', name: 'packagesCtaHref', label: 'Packages Section Button Link' },
          { type: 'string', name: 'contactHeading', label: 'Contact Section Heading' },
          { type: 'string', name: 'contactLede', label: 'Contact Section Lede', ui: { component: 'textarea' } },
        ],
      },
      {
        name: 'about',
        label: 'About Andrea',
        path: 'src/data',
        match: { include: 'about' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/about/',
        },
        fields: [
          { type: 'string', name: 'name', label: 'Headline / Name', required: true },
          { type: 'string', name: 'lede', label: 'Tagline / Subtitle', ui: { component: 'textarea' } },
          { type: 'image', name: 'portrait', label: 'Portrait Photo' },
          { type: 'string', name: 'portraitAlt', label: 'Portrait Alt Text' },
          { type: 'string', name: 'shortVersionHeading', label: 'Short Version Heading' },
          { type: 'string', name: 'shortVersionParagraphs', label: 'Bio Paragraphs', list: true, ui: { component: 'textarea' } },
          { type: 'string', name: 'educationHeading', label: 'Education Section Heading' },
          {
            type: 'object', name: 'credentials', label: 'Education Degrees / Schools', list: true,
            ui: { itemProps: (item) => ({ label: item?.school || 'School' }) },
            fields: [
              { type: 'string', name: 'school', label: 'School Name', required: true },
              { type: 'string', name: 'detail', label: 'Degree / Year', required: true },
            ],
          },
          { type: 'string', name: 'experienceHeading', label: 'Experience Section Heading' },
          { type: 'string', name: 'experience', label: 'Experience Bullet Points', list: true, ui: { component: 'textarea' } },
          {
            type: 'object', name: 'photos', label: 'Conference / Workshop Photos', list: true,
            ui: { itemProps: (item) => ({ label: item?.caption || item?.alt || 'Photo' }) },
            fields: [
              { type: 'image', name: 'image', label: 'Photo Image', required: true },
              { type: 'string', name: 'alt', label: 'Image Alt Text' },
              { type: 'string', name: 'caption', label: 'Caption' },
            ],
          },
          { type: 'string', name: 'parentNoteHeading', label: 'Parent Note Heading' },
          { type: 'string', name: 'parentNoteLede', label: 'Parent Note Message', ui: { component: 'textarea' } },
          { type: 'string', name: 'parentNoteCtaText', label: 'Parent Note Button Text' },
          { type: 'string', name: 'parentNoteCtaHref', label: 'Parent Note Button Link' },
        ],
      },
      {
        name: 'services',
        label: 'Services',
        path: 'src/data',
        match: { include: 'services' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/services/',
        },
        fields: [
          { type: 'string', name: 'pageHeading', label: 'Page Heading' },
          { type: 'string', name: 'pageLede', label: 'Page Subtitle / Lede', ui: { component: 'textarea' } },
          {
            type: 'object', name: 'services', label: 'Packages & Services List', list: true,
            ui: { itemProps: (item) => ({ label: item?.name }) },
            fields: [
              { type: 'string', name: 'id', label: 'URL id (lowercase, hyphens)', required: true },
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'tag', label: 'Package label (leave empty for non-packages)' },
              { type: 'string', name: 'summary', label: 'Summary', ui: { component: 'textarea' } },
              { type: 'string', name: 'detail', label: 'Detail', ui: { component: 'textarea' } },
              { type: 'string', name: 'keywords', label: 'SEO keywords (internal)' },
            ],
          },
          { type: 'string', name: 'processHeading', label: 'How It Works Heading' },
          { type: 'string', name: 'processMuted', label: 'How It Works Subtitle' },
          {
            type: 'object', name: 'coachingSteps', label: 'Coaching Process Steps', list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Step' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Step Title', required: true },
              { type: 'string', name: 'description', label: 'Step Description', required: true, ui: { component: 'textarea' } },
            ],
          },
          {
            type: 'object', name: 'commentingSteps', label: 'Commenting Process Steps', list: true,
            ui: { itemProps: (item) => ({ label: item?.title || 'Step' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Step Title', required: true },
              { type: 'string', name: 'description', label: 'Step Description', required: true, ui: { component: 'textarea' } },
            ],
          },
        ],
      },
      {
        name: 'resources',
        label: 'Free resources',
        path: 'src/data',
        match: { include: 'resources' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/resources/',
        },
        fields: [
          {
            type: 'object', name: 'downloads', label: 'Downloads', list: true,
            ui: { itemProps: (item) => ({ label: item?.title }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'kind', label: 'Kind (Guide, Slides, Checklist…)' },
              { type: 'image', name: 'file', label: 'File (PDF or Word)', required: true },
              { type: 'string', name: 'blurb', label: 'Summary / card blurb', ui: { component: 'textarea' } },
              { type: 'string', name: 'detail', label: 'Full description (resources page)', ui: { component: 'textarea' } },
              { type: 'string', name: 'sections', label: 'Section bullet points', list: true },
              { type: 'string', name: 'cta', label: 'Button text' },
            ],
          },
          {
            type: 'object', name: 'reads', label: 'Quick reads', list: true,
            ui: { itemProps: (item) => ({ label: item?.title || item?.sectionTitle || 'Quick read' }) },
            fields: [
              { type: 'string', name: 'id', label: 'Section ID (anchor name, e.g. dos, avoid, prompts)', required: true },
              { type: 'string', name: 'title', label: 'Card / Link title (e.g. Six things to do before you write a word)', required: true },
              { type: 'string', name: 'sectionTitle', label: 'Section heading on Resources page (e.g. Six things to do)' },
              { type: 'string', name: 'href', label: 'Link URL (e.g. /resources/#dos)' },
              { type: 'string', name: 'intro', label: 'Introductory paragraph (optional)', ui: { component: 'textarea' } },
              {
                type: 'object', name: 'items', label: 'Items / Tips / Prompts', list: true,
                ui: { itemProps: (item) => ({ label: item?.title || (item?.text ? (item.text.slice(0, 40) + '…') : 'Item') }) },
                fields: [
                  { type: 'string', name: 'title', label: 'Item title / label (optional)' },
                  { type: 'string', name: 'text', label: 'Item text / explanation / question', required: true, ui: { component: 'textarea' } },
                ],
              },
              { type: 'string', name: 'note', label: 'Footnote / callout note (optional)', ui: { component: 'textarea' } },
            ],
          },
        ],
      },
      {
        name: 'contact',
        label: 'Contact',
        path: 'src/data',
        match: { include: 'contact' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/contact/',
        },
        fields: [
          { type: 'string', name: 'heading', label: 'Page Heading', required: true },
          { type: 'string', name: 'lede', label: 'Page Subtitle / Lede', ui: { component: 'textarea' } },
          { type: 'string', name: 'reachHeading', label: 'Reach Andrea Heading' },
          { type: 'string', name: 'email', label: 'Email Address', required: true },
          { type: 'string', name: 'phone', label: 'Phone / WhatsApp' },
          { type: 'image', name: 'wechatQr', label: 'WeChat QR Code Image' },
          { type: 'string', name: 'wechatNote', label: 'WeChat Note' },
          { type: 'string', name: 'locationTitle', label: 'Location Title' },
          { type: 'string', name: 'locationNote', label: 'Location / Timezone Note', ui: { component: 'textarea' } },
          { type: 'string', name: 'agencyNote', label: 'Agency / Consultant Note', ui: { component: 'textarea' } },
          { type: 'string', name: 'chatNote', label: 'Chat Widget Tip' },
        ],
      },
      {
        name: 'results',
        label: 'Results',
        path: 'src/data',
        match: { include: 'results' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/results/',
        },
        fields: [
          { type: 'string', name: 'heading', label: 'Page Heading' },
          { type: 'string', name: 'lede', label: 'Top Blurb / Description', ui: { component: 'textarea' } },
          {
            type: 'object',
            name: 'stats',
            label: 'Track Record Statistics',
            list: true,
            ui: { itemProps: (item) => ({ label: `${item?.number || ''} — ${item?.label || ''}` }) },
            fields: [
              { type: 'string', name: 'number', label: 'Number / Stat', required: true },
              { type: 'string', name: 'label', label: 'Description Label', required: true },
            ],
          },
          {
            type: 'object',
            name: 'highlights',
            label: 'Institution Groupings (Highlight Cards)',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.tier || 'Institution Tier' }) },
            fields: [
              { type: 'string', name: 'tier', label: 'Category / Tier Name', required: true },
              { type: 'string', name: 'description', label: 'Institutions List', ui: { component: 'textarea' }, required: true },
            ],
          },
          { type: 'string', name: 'disclaimer', label: 'Disclaimer Note', ui: { component: 'textarea' } },
          { type: 'string', name: 'methodologyHeading', label: 'Methodology Heading' },
          { type: 'string', name: 'methodologyText', label: 'Methodology / Ethics Statement', ui: { component: 'textarea' } },
          { type: 'string', name: 'localDiscoveryText', label: 'Local Discovery Text / Note', ui: { component: 'textarea' } },
          { type: 'string', name: 'ctaHeading', label: 'Bottom Banner Heading' },
          { type: 'string', name: 'ctaLede', label: 'Bottom Banner Lede', ui: { component: 'textarea' } },
          { type: 'string', name: 'ctaPrimaryText', label: 'Primary Button Text' },
          { type: 'string', name: 'ctaPrimaryHref', label: 'Primary Button Link' },
          { type: 'string', name: 'ctaSecondaryText', label: 'Secondary Button Text' },
          { type: 'string', name: 'ctaSecondaryHref', label: 'Secondary Button Link' },
        ],
      },
      {
        name: 'blog',
        label: 'Blog Page',
        path: 'src/data',
        match: { include: 'blog' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/blog/',
        },
        fields: [
          {
            type: 'string',
            name: '_postsManager',
            label: 'Manage Blog Posts',
            ui: {
              component: 'blog-posts-manager',
            },
          },
          { type: 'string', name: 'heading', label: 'Page Heading' },
          { type: 'string', name: 'lede', label: 'Page Lede / Subtitle', ui: { component: 'textarea' } },
        ],
      },
      {
        name: 'post',
        label: 'Blog Posts',
        path: 'src/content/blog',
        format: 'md',
        ui: {
          router: ({ document }) => `/blog/${document._sys.filename}/`,
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'description', label: 'Description (shows in Google and on the blog index)', required: true, ui: { component: 'textarea' } },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'image', name: 'image', label: 'Cover image (optional)' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'reviews',
        label: 'Reviews',
        path: 'src/data',
        match: { include: 'reviews' },
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          global: false,
          router: () => '/#reviews',
        },
        fields: [
          { type: 'number', name: 'rating', label: 'Google rating (e.g. 5)' },
          { type: 'number', name: 'count', label: 'Number of Google reviews' },
          { type: 'string', name: 'url', label: 'Google reviews link' },
          {
            type: 'object', name: 'reviews', label: 'Reviews', list: true,
            ui: { itemProps: (item) => ({ label: item?.name }) },
            fields: [
              { type: 'string', name: 'name', label: 'Name', required: true },
              { type: 'string', name: 'role', label: 'Who they are (Parent, Student, Consultant…)' },
              { type: 'string', name: 'when', label: 'Month (YYYY-MM)' },
              { type: 'string', name: 'text', label: 'Review', ui: { component: 'textarea' }, required: true },
            ],
          },
        ],
      },
    ],
  },
});

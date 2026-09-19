import { defineConfig } from 'tinacms';

// Editing happens at /admin. Locally: `npm run dev`. In production the same URL works once
// TINA_CLIENT_ID / TINA_TOKEN from app.tina.io are set on the host.
export default defineConfig({
  branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main',
  clientId: process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: { outputFolder: 'admin', publicFolder: 'public' },
  media: { tina: { mediaRoot: 'uploads', publicFolder: 'public' } },
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Blog posts',
        path: 'src/content/blog',
        format: 'md',
        ui: { router: ({ document }) => `/blog/${document._sys.filename}/` },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'string', name: 'description', label: 'Description (shows in Google and on the blog index)', required: true, ui: { component: 'textarea' } },
          { type: 'datetime', name: 'date', label: 'Date', required: true },
          { type: 'image', name: 'image', label: 'Cover image (optional)' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'resources',
        label: 'Free resources',
        path: 'src/data',
        match: { include: 'resources' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/resources/' },
        fields: [
          {
            type: 'object', name: 'downloads', label: 'Downloads', list: true,
            ui: { itemProps: (item) => ({ label: item?.title }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'kind', label: 'Kind (Guide, Slides, Checklist…)' },
              { type: 'image', name: 'file', label: 'File (PDF or Word)', required: true },
              { type: 'string', name: 'blurb', label: 'One or two sentences', ui: { component: 'textarea' } },
              { type: 'string', name: 'cta', label: 'Button text' },
            ],
          },
          {
            type: 'object', name: 'reads', label: 'Quick reads', list: true,
            ui: { itemProps: (item) => ({ label: item?.title }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'href', label: 'Link', required: true },
            ],
          },
        ],
      },
      {
        name: 'reviews',
        label: 'Reviews',
        path: 'src/data',
        match: { include: 'reviews' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/#reviews' },
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
      {
        name: 'services',
        label: 'Services',
        path: 'src/data',
        match: { include: 'services' },
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/services/' },
        fields: [
          {
            type: 'object', name: 'services', label: 'Services', list: true,
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
        ],
      },
    ],
  },
});

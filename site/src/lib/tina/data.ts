import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../tina/__generated__/client';

export const getHome = async () => {
  return requestWithMetadata(
    client.queries.front({ relativePath: 'home.json' }),
    { priority: 'primary' }
  );
};

export const getAbout = async () => {
  return requestWithMetadata(
    client.queries.about({ relativePath: 'about.json' }),
    { priority: 'primary' }
  );
};

export const getServices = async () => {
  return requestWithMetadata(
    client.queries.services({ relativePath: 'services.json' }),
    { priority: 'primary' }
  );
};

export const getResources = async () => {
  return requestWithMetadata(
    client.queries.resources({ relativePath: 'resources.json' }),
    { priority: 'primary' }
  );
};

export const getContact = async () => {
  return requestWithMetadata(
    client.queries.contact({ relativePath: 'contact.json' }),
    { priority: 'primary' }
  );
};

export const getBlogPost = async (id: string) => {
  return requestWithMetadata(
    client.queries.post({ relativePath: `${id}.md` }),
    { priority: 'primary' }
  );
};

export const getReviews = async () => {
  return requestWithMetadata(
    client.queries.reviews({ relativePath: 'reviews.json' }),
    { priority: 'secondary' }
  );
};

export const getResults = async () => {
  return requestWithMetadata(
    client.queries.results({ relativePath: 'results.json' }),
    { priority: 'primary' }
  );
};

export const getBlog = async () => {
  return requestWithMetadata(
    client.queries.blog({ relativePath: 'blog.json' }),
    { priority: 'primary' }
  );
};

export const getNewCanaan = async () => {
  return requestWithMetadata(
    (client.queries as any).newCanaan?.({ relativePath: 'new-canaan.json' }),
    { priority: 'primary' }
  );
};

export const getFairfieldCounty = async () => {
  return requestWithMetadata(
    (client.queries as any).fairfieldCounty?.({ relativePath: 'fairfield-county.json' }),
    { priority: 'primary' }
  );
};

export const getGuidesIndex = async () => {
  return requestWithMetadata(
    (client.queries as any).guidesIndex?.({ relativePath: 'guides-index.json' }),
    { priority: 'primary' }
  );
};

export const getGuidePost = async (id: string) => {
  return requestWithMetadata(
    (client.queries as any).guide?.({ relativePath: `${id}.md` }),
    { priority: 'primary' }
  );
};


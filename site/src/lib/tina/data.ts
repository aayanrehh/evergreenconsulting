import { requestWithMetadata } from '@tinacms/astro/data';
import client from '../../../tina/__generated__/client';

export const getHome = async () => {
  return requestWithMetadata(
    client.queries.front({ relativePath: 'home.json' }),
    { priority: 'primary' }
  );
};

import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type { FrontQuery } from '../../../tina/__generated__/types';
import HomeHero from '../../components/islands/HomeHero.astro';
import { getHome } from './data';

export const islands: IslandRegistry = {
  hero: {
    fetch: () => getHome(),
    component: HomeHero,
    wrapper: { tag: 'section', className: 'hero' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>).data?.front,
    }),
  },
};

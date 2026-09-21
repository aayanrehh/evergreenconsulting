import type { IslandRegistry } from '@tinacms/astro/experimental';
import type { QueryResult } from '@tinacms/astro/data';
import type {
  FrontQuery,
  AboutQuery,
  ServicesQuery,
  ResourcesQuery,
  ContactQuery,
  PostQuery,
  ReviewsQuery,
} from '../../../tina/__generated__/types';
import HomeHero from '../../components/islands/HomeHero.astro';
import HomeBand from '../../components/islands/HomeBand.astro';
import HomeHow from '../../components/islands/HomeHow.astro';
import HomePackages from '../../components/islands/HomePackages.astro';
import HomeContact from '../../components/islands/HomeContact.astro';
import HomeReviews from '../../components/islands/HomeReviews.astro';
import AboutContent from '../../components/islands/AboutContent.astro';
import ServicesContent from '../../components/islands/ServicesContent.astro';
import ResourcesContent from '../../components/islands/ResourcesContent.astro';
import ContactContent from '../../components/islands/ContactContent.astro';
import BlogPostContent from '../../components/islands/BlogPostContent.astro';
import ResultsHeader from '../../components/islands/ResultsHeader.astro';
import BlogHeader from '../../components/islands/BlogHeader.astro';
import NewCanaanContent from '../../components/islands/NewCanaanContent.astro';
import FairfieldCountyContent from '../../components/islands/FairfieldCountyContent.astro';
import GuidesIndexContent from '../../components/islands/GuidesIndexContent.astro';
import GuidePostContent from '../../components/islands/GuidePostContent.astro';
import {
  getHome,
  getAbout,
  getServices,
  getResources,
  getContact,
  getBlogPost,
  getReviews,
  getResults,
  getBlog,
  getNewCanaan,
  getFairfieldCounty,
  getGuidesIndex,
  getGuidePost,
} from './data';


export const islands: IslandRegistry = {
  hero: {
    fetch: () => getHome(),
    component: HomeHero,
    wrapper: { tag: 'section', className: 'hero' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>)?.data?.front,
    }),
  },
  'home-band': {
    fetch: () => getHome(),
    component: HomeBand,
    wrapper: { tag: 'section', className: 'section section--evergreen band' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>)?.data?.front,
    }),
  },
  'home-how': {
    fetch: () => getHome(),
    component: HomeHow,
    wrapper: { tag: 'section', className: 'section' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>)?.data?.front,
    }),
  },
  'home-packages': {
    fetch: () => getHome(),
    component: HomePackages,
    wrapper: { tag: 'section', className: 'section section--linen' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>)?.data?.front,
    }),
  },
  'home-contact': {
    fetch: () => getHome(),
    component: HomeContact,
    wrapper: { tag: 'section', className: 'section' },
    propsFromData: (data) => ({
      front: (data as QueryResult<FrontQuery>)?.data?.front,
    }),
  },
  'home-reviews': {
    fetch: () => getReviews(),
    component: HomeReviews,
    wrapper: { tag: 'section', className: 'section reviews' },
    propsFromData: (data) => ({
      reviewsData: (data as QueryResult<ReviewsQuery>)?.data?.reviews,
    }),
  },
  about: {
    fetch: () => getAbout(),
    component: AboutContent,
    wrapper: { tag: 'div', className: 'about-page' },
    propsFromData: (data) => ({
      about: (data as QueryResult<AboutQuery>)?.data?.about,
    }),
  },
  services: {
    fetch: () => getServices(),
    component: ServicesContent,
    wrapper: { tag: 'div', className: 'services-page' },
    propsFromData: (data) => ({
      data: (data as QueryResult<ServicesQuery>)?.data?.services,
    }),
  },
  resources: {
    fetch: () => getResources(),
    component: ResourcesContent,
    wrapper: { tag: 'div', className: 'resources-page' },
    propsFromData: (data) => ({
      data: (data as QueryResult<ResourcesQuery>)?.data?.resources,
    }),
  },
  contact: {
    fetch: () => getContact(),
    component: ContactContent,
    wrapper: { tag: 'div', className: 'contact-page' },
    propsFromData: (data) => ({
      contact: (data as QueryResult<ContactQuery>)?.data?.contact,
    }),
  },
  'blog-post': {
    fetch: (_req, params) => {
      const id = params.get('id') || '';
      return getBlogPost(id);
    },
    component: BlogPostContent,
    wrapper: { tag: 'article', className: 'section post' },
    propsFromData: (data) => ({
      post: (data as QueryResult<PostQuery>)?.data?.post,
    }),
  },
  'results-header': {
    fetch: () => getResults(),
    component: ResultsHeader,
    wrapper: { tag: 'div', className: 'results-header-wrap' },
    propsFromData: (data: any) => ({
      results: data?.data?.results,
    }),
  },
  'blog-header': {
    fetch: () => getBlog(),
    component: BlogHeader,
    wrapper: { tag: 'div', className: 'blog-header-wrap' },
    propsFromData: (data: any) => ({
      blog: data?.data?.blog,
    }),
  },
  'new-canaan': {
    fetch: () => getNewCanaan(),
    component: NewCanaanContent,
    wrapper: { tag: 'div', className: 'new-canaan-page' },
    propsFromData: (data: any) => ({
      data: data?.data?.newCanaan,
    }),
  },
  'fairfield-county': {
    fetch: () => getFairfieldCounty(),
    component: FairfieldCountyContent,
    wrapper: { tag: 'div', className: 'fairfield-county-page' },
    propsFromData: (data: any) => ({
      data: data?.data?.fairfieldCounty,
    }),
  },
  'guides-index': {
    fetch: () => getGuidesIndex(),
    component: GuidesIndexContent,
    wrapper: { tag: 'div', className: 'guides-index-wrap' },
    propsFromData: (data: any) => ({
      data: data?.data?.guidesIndex,
    }),
  },
  'guide-post': {
    fetch: (_req, params) => {
      const id = params.get('id') || '';
      return getGuidePost(id);
    },
    component: GuidePostContent,
    wrapper: { tag: 'article', className: 'section post guide-post' },
    propsFromData: (data: any) => ({
      guide: data?.data?.guide,
    }),
  },
};


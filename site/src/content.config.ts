import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    image: z.string().optional(),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().optional(),
    locality: z.string().optional(),
    searchIntent: z.string().optional(),
    readerQuestion: z.string().optional(),
    image: z.string().optional(),
    draft: z.boolean().optional(),
    sources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().optional(),
        })
      )
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    relatedPages: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          optionalDescription: z.string().optional(),
        })
      )
      .optional(),
    cta: z
      .object({
        show: z.boolean().optional(),
        heading: z.string().optional(),
        text: z.string().optional(),
        buttonText: z.string().optional(),
        buttonHref: z.string().optional(),
      })
      .optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const collections = { blog, guides };


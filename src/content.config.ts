import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog técnico: Markdown en src/content/blog, uno por post.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };

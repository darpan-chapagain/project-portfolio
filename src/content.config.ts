import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Generated from README.md by `npm run content`. Edit the README, not these files.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    tagline: z.string().optional(),
    kind: z.enum(['professional', 'independent']),
    order: z.number(),
    domain: z.string(),
    role: z.string(),
    summary: z.string(),
    results: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    company: z.string().optional(),
    client: z.string().optional(),
    art: z.string().default('star'),
    group: z.enum(['fintech', 'platforms', 'ai', 'games']).default('fintech'),
    featured: z.boolean().default(false),
    repo: z.string().url().optional(),
    apps: z
      .array(z.object({ name: z.string(), url: z.string().url(), blurb: z.string(), art: z.string().default('star') }))
      .default([]),
  }),
});

// Blog posts and book reviews. Files starting with _ are ignored (see _template.md).
const writing = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['post', 'review']).default('post'),
    summary: z.string(),
    book: z
      .object({
        title: z.string(),
        author: z.string(),
        rating: z.number().min(1).max(5).optional(),
      })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, writing };

import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    forWho: z.string(),
    deliverables: z.array(z.string()),
    outcomes: z.array(z.string()),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    sector: z.string(),
    service: z.enum(['consulting', 'fintech', 'implementation']),
    summary: z.string(),
    year: z.string(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/testimonials.json'),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    title: z.string(),
  }),
});

const timeline = defineCollection({
  loader: file('./src/content/timeline.json'),
  schema: z.object({
    period: z.string(),
    role: z.string(),
    org: z.string(),
    note: z.string(),
    order: z.number(),
  }),
});

export const collections = { services, caseStudies, testimonials, timeline };

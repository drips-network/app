import { z } from 'zod';

export const metadataSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  coverImage: z.string(),
  coverImageAlt: z.string(),
});

export const postsListingSchema = z.array(
  metadataSchema.extend({
    slug: z.string(),
  }),
);

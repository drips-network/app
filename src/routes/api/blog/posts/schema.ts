import { z } from 'zod';

export const BLOG_CATEGORIES = ['wave', 'product', 'roundup', 'ecosystem', 'guide'] as const;

export const BLOG_CATEGORY_LABELS: Record<(typeof BLOG_CATEGORIES)[number], string> = {
  product: 'Product',
  roundup: 'Roundups',
  ecosystem: 'Ecosystem',
  guide: 'Guides',
  wave: 'Wave',
};

export const metadataSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.string(),
  coverImage: z.string(),
  coverImageAlt: z.string(),
  announcementBannerCopy: z.string().optional(),
  author: z.union([z.string(), z.array(z.string())]).optional(),
  categories: z.array(z.enum(BLOG_CATEGORIES)).min(1),
});

export const authorSchema = z.object({
  name: z.string(),
  avatarUrl: z.string(),
});

export const postsListingSchema = z.array(
  metadataSchema.omit({ author: true }).extend({
    slug: z.string(),
    authors: z.array(authorSchema),
  }),
);

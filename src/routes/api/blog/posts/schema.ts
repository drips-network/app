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
  // Accept both string and Date: hand-authored posts quote the date so YAML
  // parses it as a string, while CMS-authored posts write it unquoted and
  // YAML 1.1 auto-parses YYYY-MM-DD as a Date.
  date: z.preprocess((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v), z.string()),
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

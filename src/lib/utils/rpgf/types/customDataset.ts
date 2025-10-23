import z from 'zod';

export const customDatasetSchema = z.object({
  id: z.string(),
  roundId: z.string(),
  name: z.string(),
  isPublic: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  rowCount: z.number().int().nonnegative(),
});
export type CustomDataset = z.infer<typeof customDatasetSchema>;

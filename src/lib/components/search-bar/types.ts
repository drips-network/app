import { z } from 'zod';

export const commonMeiliAttributes = z.object({
  _matchesPosition: z
    .record(z.array(z.object({ start: z.number(), length: z.number() })))
    .optional(),
});

export const projectResultSchema = commonMeiliAttributes.extend({
  type: z.literal('project'),
  id: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  url: z.string(),
  ownerAddress: z.string().nullable().optional(),
  avatarCid: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  emoji: z.string().nullable().optional(),
  _formatted: z
    .object({
      id: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
      url: z.string().optional(),
      ownerAddress: z.string().nullable().optional(),
    })
    .optional(),
});

export const dripListSchema = commonMeiliAttributes.extend({
  type: z.literal('drip_list'),
  id: z.string().nullable(),
  name: z.string().nullable(),
  ownerAddress: z.string().nullable(),
  _formatted: z.object({
    id: z.string().nullable(),
    name: z.string().nullable(),
    ownerAddress: z.string().nullable(),
  }),
});

export const resultSchema = z.union([projectResultSchema, dripListSchema]);
export const resultsSchema = z.array(resultSchema);

export type EnsResult = {
  type: 'ens';
  name: string;
  address: string;
};

export type ProjectResult = z.infer<typeof projectResultSchema>;
export type DripListResult = z.infer<typeof dripListSchema>;
export type Result = z.infer<typeof resultSchema> | EnsResult;

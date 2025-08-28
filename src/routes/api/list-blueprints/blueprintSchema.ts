import z from 'zod';

const MAX_SPLITS_WEIGHT = 1000000;

const addressReceiver = z.object({
  type: z.literal('address'),
  ethAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  weight: z.number().min(0).max(MAX_SPLITS_WEIGHT),
});

const projectReceiver = z.object({
  type: z.literal('project'),
  // string with repoOwner/repoName
  repoName: z.string().regex(/^[^/]+\/[^/]+$/),
  weight: z.number().min(0).max(MAX_SPLITS_WEIGHT),
});

const dripListReceiver = z.object({
  type: z.literal('drip-list'),
  accountId: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  weight: z.number().min(0).max(MAX_SPLITS_WEIGHT),
});

const orcidIdReceiver = z.object({
  type: z.literal('orcid-id'),
  orcidId: z.string().regex(/^(\d{4}-){3}\d{3}(\d|X)$/),
  weight: z.number().min(0).max(MAX_SPLITS_WEIGHT),
});

const splitsSchema = z.union([addressReceiver, projectReceiver, dripListReceiver, orcidIdReceiver]);

const blueprintSchema = z.object({
  listName: z.string().min(1).max(200),
  listDescription: z.string().max(1000).optional(),
  splits: z.array(splitsSchema).min(1).max(200),
});

export type Split = z.infer<typeof splitsSchema>;
export type AddressReceiver = z.infer<typeof addressReceiver>;
export type ProjectReceiver = z.infer<typeof projectReceiver>;
export type DripListReceiver = z.infer<typeof dripListReceiver>;
export type Blueprint = z.infer<typeof blueprintSchema>;
export { blueprintSchema };

import z from 'zod';

export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  .transform((address) => address.toLowerCase());

export const roundStateSchema = z.union([
  z.literal('pending-intake'),
  z.literal('intake'),
  z.literal('pending-voting'),
  z.literal('voting'),
  z.literal('pending-results'),
  z.literal('results'),
]);
export type RoundState = z.infer<typeof roundStateSchema>;

export const possibleColorSchema = z.union([
  z.literal('#27C537'),
  z.literal('#FF5F5F'),
  z.literal('#5FB2FF'),
  z.literal('#9A5E27'),
  z.literal('#9B5DFF'),
  z.literal('#FF84DC'),
  z.literal('#FFA24B'),
  z.literal('#27939A'),
  z.literal('#FFAB99'),
  z.literal('#FF7020'),
  z.literal('#FFC120'),
  z.literal('#BD4139'),
  z.literal('#5555FF'),
  z.literal('#BBA781'),
  z.literal('#9BD226'),
]);
export type PossibleColor = z.infer<typeof possibleColorSchema>;

// Simply just renders some markdown content in the application form
export const applicationMarkdownFieldSchema = z.object({
  type: z.literal('markdown'),
  content: z.string().min(1).max(50000),
});

// Displays a horizontal line in the application form
export const applicationDividerFieldSchema = z.object({
  type: z.literal('divider'),
});

// Displays as a standard text field
export const applicationTextFieldSchema = z.object({
  type: z.literal('text'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});

// Displays as a standard text area
export const applicationTextAreaFieldSchema = z.object({
  type: z.literal('textarea'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});

// Displays as a text field that validates for a valid URL
export const applicationUrlFieldSchema = z.object({
  type: z.literal('url'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});

// Displays as a text field that validates for a valid email
export const applicationEmailFieldSchema = z.object({
  type: z.literal('email'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});

// Allows building a list of entries, where each entry has all the fields defined in entryFields
export const applicationListFieldSchema = z.object({
  type: z.literal('list'),
  private: z.boolean(),
  slug: z.string().min(1).max(255),
  required: z.boolean(),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
  maxItems: z.number().int().positive(),
  entryFields: z.array(
    z.union([
      z.object({
        type: z.literal('number'),
        label: z.string().min(1).max(255),
      }),
      z.object({
        type: z.literal('text'),
        label: z.string().min(1).max(255),
      }),
      z.object({
        type: z.literal('url'),
        label: z.string().min(1).max(255),
      }),
    ]),
  ),
});

// Displays as a ListSelect component, either multi- or single-select
export const applicationSelectFieldSchema = z.object({
  type: z.literal('select'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
  options: z.array(
    z.object({
      label: z.string().min(1).max(255),
      value: z.string().min(1).max(255),
    }),
  ),
  allowMultiple: z.boolean().optional(),
});

const applicationFieldSchema = z.union([
  applicationMarkdownFieldSchema,
  applicationDividerFieldSchema,
  applicationTextFieldSchema,
  applicationTextAreaFieldSchema,
  applicationUrlFieldSchema,
  applicationEmailFieldSchema,
  applicationListFieldSchema,
  applicationSelectFieldSchema,
]);

const applicationFormatSchema = z.array(applicationFieldSchema).max(50);
export type ApplicationFormat = z.infer<typeof applicationFormatSchema>;

export const roundPublicFieldsSchema = z.object({
  id: z.string().uuid(),
  chainId: z.number(),
  emoji: z.string().emoji(),
  color: possibleColorSchema,
  urlSlug: z.string().transform((val) => val.toLowerCase()),
  state: roundStateSchema,
  name: z.string(),
  description: z.string().nullable(),
  applicationPeriodStart: z.string().pipe(z.coerce.date()),
  applicationPeriodEnd: z.string().pipe(z.coerce.date()),
  votingPeriodStart: z.string().pipe(z.coerce.date()),
  votingPeriodEnd: z.string().pipe(z.coerce.date()),
  resultsPeriodStart: z.string().pipe(z.coerce.date()),
  applicationFormat: applicationFormatSchema,
  votingConfig: z.object({
    maxVotesPerVoter: z.number().int().positive(),
    maxVotesPerProjectPerVoter: z.number().int().positive(),
  }),
  createdByUserId: z.string().uuid(),
  createdAt: z.string().pipe(z.coerce.date()),
  updatedAt: z.string().pipe(z.coerce.date()),
});
export type RoundPublicFields = z.infer<typeof roundPublicFieldsSchema>;

export const roundAdminFieldsSchema = roundPublicFieldsSchema.extend({
  votingConfig: z.object({
    maxVotesPerVoter: z.number().int().positive(),
    maxVotesPerProjectPerVoter: z.number().int().positive(),
    allowedVoters: z.array(z.string()).nonempty(),
  }),
  adminWalletAddresses: z.array(ethereumAddressSchema).nonempty(), // Array of wallet addresses
});
export type RoundAdminFields = z.infer<typeof roundAdminFieldsSchema>;

export const createRoundDtoSchema = z.object({
  name: z.string().min(1).max(255),
  emoji: z.string().emoji(),
  color: possibleColorSchema,
  urlSlug: z
    .string()
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL slug must be URL-safe')
    .transform((val) => val.toLowerCase()),
  chainId: z.number().int().positive(),
  description: z.string().max(10000).optional(),
  applicationPeriodStart: z.date().transform((v) => v.toISOString()),
  applicationPeriodEnd: z.date().transform((v) => v.toISOString()),
  votingPeriodStart: z.date().transform((v) => v.toISOString()),
  votingPeriodEnd: z.date().transform((v) => v.toISOString()),
  resultsPeriodStart: z.date().transform((v) => v.toISOString()),
  applicationFormat: applicationFormatSchema,
  votingConfig: z.object({
    maxVotesPerVoter: z.number().int().positive(),
    maxVotesPerProjectPerVoter: z.number().int().positive(),
    allowedVoters: z.array(ethereumAddressSchema).nonempty(),
  }),
  adminWalletAddresses: z.array(ethereumAddressSchema).nonempty(), // Array of wallet addresses
});
export type CreateRoundDto = z.infer<typeof createRoundDtoSchema>;

export const createRoundDraftDtoSchema = createRoundDtoSchema.partial().extend({
  chainId: z.number().int().positive(),
  emoji: z.string().emoji(),
  color: possibleColorSchema,
  adminWalletAddresses: z.array(ethereumAddressSchema).nonempty(),
});
export type CreateRoundDraftDto = z.infer<typeof createRoundDraftDtoSchema>;

export const patchRoundDtoSchema = createRoundDtoSchema.partial();
export type PatchRoundDto = z.infer<typeof patchRoundDtoSchema>;

export const roundDraftSchema = createRoundDraftDtoSchema.extend({
  applicationPeriodStart: z.string().pipe(z.coerce.date()).optional(),
  applicationPeriodEnd: z.string().pipe(z.coerce.date()).optional(),
  votingPeriodStart: z.string().pipe(z.coerce.date()).optional(),
  votingPeriodEnd: z.string().pipe(z.coerce.date()).optional(),
  resultsPeriodStart: z.string().pipe(z.coerce.date()).optional(),
});
export type RoundDraft = z.infer<typeof roundDraftSchema>;

export const roundDraftWrapperDto = z.object({
  id: z.string().uuid(),
  chainId: z.number(),
  draft: roundDraftSchema,
  validation: z.object({
    scheduleValid: z.boolean(),
    draftComplete: z.boolean(),
  }),
});
export type RoundDraftWrapperDto = z.infer<typeof roundDraftWrapperDto>;

export const slugAvailableResponseSchema = z.object({
  available: z.boolean(),
});

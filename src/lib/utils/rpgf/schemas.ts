import z from 'zod';
import mapFilterUndefined from '../map-filter-undefined';

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
export type ApplicationMarkdownField = z.infer<typeof applicationMarkdownFieldSchema>;

// Displays a horizontal line in the application form
export const applicationDividerFieldSchema = z.object({
  type: z.literal('divider'),
});
export type ApplicationDividerField = z.infer<typeof applicationDividerFieldSchema>;

// Displays as a standard text field
export const applicationTextFieldSchema = z.object({
  type: z.literal('text'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationTextField = z.infer<typeof applicationTextFieldSchema>;

// Displays as a standard text area
export const applicationTextAreaFieldSchema = z.object({
  type: z.literal('textarea'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationTextAreaField = z.infer<typeof applicationTextAreaFieldSchema>;

// Displays as a text field that validates for a valid URL
export const applicationUrlFieldSchema = z.object({
  type: z.literal('url'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationUrlField = z.infer<typeof applicationUrlFieldSchema>;

// Displays as a text field that validates for a valid email
export const applicationEmailFieldSchema = z.object({
  type: z.literal('email'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationEmailField = z.infer<typeof applicationEmailFieldSchema>;

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
export type ApplicationListField = z.infer<typeof applicationListFieldSchema>;

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
export type ApplicationSelectField = z.infer<typeof applicationSelectFieldSchema>;

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
export type ApplicationField = z.infer<typeof applicationFieldSchema>;

const applicationFormatSchema = z.array(applicationFieldSchema).max(50);
export type ApplicationFormat = z.infer<typeof applicationFormatSchema>;

const roundPublicFieldsSchema = z.object({
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
  adminWalletAddresses: z.array(ethereumAddressSchema).nonempty(), // Array of wallet addresses
  isAdmin: z.literal(false),
});

const roundAdminFieldsSchema = roundPublicFieldsSchema.extend({
  votingConfig: z.object({
    maxVotesPerVoter: z.number().int().positive(),
    maxVotesPerProjectPerVoter: z.number().int().positive(),
    allowedVoters: z.array(z.string()).nonempty(),
  }),
  isAdmin: z.literal(true),
});

export const wrappedRoundPublicSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('round'),
  chainId: z.number(),
  round: roundPublicFieldsSchema,
  isVoter: z.boolean(),
});
export type WrappedRoundPublic = z.infer<typeof wrappedRoundPublicSchema>;

export const wrappedRoundAdminSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('round'),
  chainId: z.number(),
  round: roundAdminFieldsSchema,
  isVoter: z.boolean(),
});
export type WrappedRoundAdmin = z.infer<typeof wrappedRoundAdminSchema>;

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
  description: z.string().max(10000).nullish(),
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

export const patchRoundDtoSchema = createRoundDtoSchema.partial().extend({
  applicationPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  applicationPeriodEnd: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  votingPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  votingPeriodEnd: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  resultsPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
});
export type PatchRoundDto = z.input<typeof patchRoundDtoSchema>;

export const wrappedRoundDraftSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('round-draft'),
  chainId: z.number(),
  draft: createRoundDraftDtoSchema.extend({
    color: possibleColorSchema,
    emoji: z.string().emoji(),
    applicationPeriodStart: z.string().pipe(z.coerce.date()).optional(),
    applicationPeriodEnd: z.string().pipe(z.coerce.date()).optional(),
    votingPeriodStart: z.string().pipe(z.coerce.date()).optional(),
    votingPeriodEnd: z.string().pipe(z.coerce.date()).optional(),
    resultsPeriodStart: z.string().pipe(z.coerce.date()).optional(),
  }),
  validation: z.object({
    scheduleValid: z.boolean(),
    draftComplete: z.boolean(),
  }),
});
export type WrappedRoundDraft = z.infer<typeof wrappedRoundDraftSchema>;

export const patchRoundDraftDtoSchema = createRoundDraftDtoSchema.partial().extend({
  applicationPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  applicationPeriodEnd: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  votingPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  votingPeriodEnd: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
  resultsPeriodStart: z
    .date()
    .transform((v) => v.toISOString())
    .optional(),
});
export type PatchRoundDraftDto = z.input<typeof patchRoundDraftDtoSchema>;

export const slugAvailableResponseSchema = z.object({
  available: z.boolean(),
});

export const applicationStateSchema = z.enum(['pending', 'approved', 'rejected']);
export type ApplicationState = z.infer<typeof applicationStateSchema>;

function buildDynamicApplicatonFieldSchema(applicationFormat: ApplicationFormat) {
  const fillableFields = applicationFormat.filter((f) => 'slug' in f);

  const fields = Object.fromEntries(
    mapFilterUndefined(fillableFields, (field) => {
      let fieldSchema;

      switch (field.type) {
        case 'text':
        case 'textarea':
          fieldSchema = z.string().min(1).max(255);
          break;
        case 'url':
          fieldSchema = z.string().url();
          break;
        case 'email':
          fieldSchema = z.string().email();
          break;
        case 'list':
          fieldSchema = z
            .array(z.record(z.string(), z.union([z.string(), z.number()])))
            .max(field.maxItems);
          break;
        case 'select':
          fieldSchema = field.allowMultiple ? z.array(z.string()) : z.string();
          break;
        default:
          return undefined;
      }

      if (!fieldSchema) return undefined;

      if (field.private) fieldSchema = fieldSchema.optional();

      if (!field.required) fieldSchema = fieldSchema.optional();

      return [field.slug, fieldSchema];
    }),
  );

  return z.object(fields);
}

export const createApplicationDtoSchema = (applicationFormat: ApplicationFormat) =>
  z.object({
    projectName: z.string().min(1).max(255),
    dripsAccountId: z.string().min(1).max(255),
    attestationUID: z.string().min(1).max(255).optional(),
    fields: buildDynamicApplicatonFieldSchema(applicationFormat),
  });
export type CreateApplicationDto = z.infer<ReturnType<typeof createApplicationDtoSchema>>;

export const projectChainDataSchema = z.object({
  avatar: z.union([
    z.object({
      emoji: z.string(),
    }),
    z.object({
      cid: z.string(),
    }),
  ]),
  color: z.string(),
  owner: z.object({
    address: z.string(),
  }),
});
export type ProjectChainData = z.infer<typeof projectChainDataSchema>;

export const applicationSchema = (applicationFormat: ApplicationFormat) =>
  z.object({
    id: z.string(),
    state: applicationStateSchema,
    projectName: z.string().min(1).max(255),
    dripsProjectDataSnapshot: projectChainDataSchema,
    dripsAccountId: z.string().min(1).max(255),
    submitterUserId: z.string(),
    roundId: z.string(),
    fields: buildDynamicApplicatonFieldSchema(applicationFormat),
    createdAt: z.string().pipe(z.coerce.date()),
    updatedAt: z.string().pipe(z.coerce.date()),
  });
export type Application = z.infer<ReturnType<typeof applicationSchema>>;

export const applicationReviewDtoSchema = z.array(
  z.object({
    applicationId: z.string(),
    decision: z.enum(['approve', 'reject']),
  }),
);
export type ApplicationReviewDto = z.infer<typeof applicationReviewDtoSchema>;

export const ballotSchema = z.record(z.string().uuid(), z.number().int().positive());
export type Ballot = z.infer<typeof ballotSchema>;
export type InProgressBallot = Record<string, number | null>;

export const submitBallotDtoSchema = z.object({
  roundId: z.string(),
  ballot: ballotSchema,
});

export const wrappedBallotDtoSchema = z.object({
  id: z.string().uuid(),
  chainId: z.number(),
  ballot: submitBallotDtoSchema,
});

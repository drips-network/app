import { z } from 'zod';
import { userSchema } from './user';

// Simply just renders some markdown content in the application form
export const applicationMarkdownFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('markdown'),
  content: z.string().min(1).max(50000),
});
export type ApplicationMarkdownField = z.infer<typeof applicationMarkdownFieldSchema>;
export const applicationMarkdownFieldDtoSchema = applicationMarkdownFieldSchema.omit({ id: true });
export type ApplicationMarkdownFieldDto = z.infer<typeof applicationMarkdownFieldDtoSchema>;

// Displays a horizontal line in the application form
export const applicationDividerFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('divider'),
});
export type ApplicationDividerField = z.infer<typeof applicationDividerFieldSchema>;
export const applicationDividerFieldDtoSchema = applicationDividerFieldSchema.omit({ id: true });
export type ApplicationDividerFieldDto = z.infer<typeof applicationDividerFieldDtoSchema>;

// Displays as a standard text field
export const applicationTextFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('text'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationTextField = z.infer<typeof applicationTextFieldSchema>;
export const applicationTextFieldDtoSchema = applicationTextFieldSchema.omit({ id: true });
export type ApplicationTextFieldDto = z.infer<typeof applicationTextFieldDtoSchema>;

// Displays as a standard text area
export const applicationTextAreaFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('textarea'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationTextAreaField = z.infer<typeof applicationTextAreaFieldSchema>;
export const applicationTextAreaFieldDtoSchema = applicationTextAreaFieldSchema.omit({ id: true });
export type ApplicationTextAreaFieldDto = z.infer<typeof applicationTextAreaFieldDtoSchema>;

// Displays as a text field that validates for a valid URL
export const applicationUrlFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('url'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationUrlField = z.infer<typeof applicationUrlFieldSchema>;
export const applicationUrlFieldDtoSchema = applicationUrlFieldSchema.omit({ id: true });
export type ApplicationUrlFieldDto = z.infer<typeof applicationUrlFieldDtoSchema>;

// Displays as a text field that validates for a valid email
export const applicationEmailFieldSchema = z.object({
  id: z.string().min(1).max(255),
  type: z.literal('email'),
  private: z.boolean(),
  required: z.boolean(),
  slug: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  descriptionMd: z.string().max(10000).optional(),
});
export type ApplicationEmailField = z.infer<typeof applicationEmailFieldSchema>;
export const applicationEmailFieldDtoSchema = applicationEmailFieldSchema.omit({ id: true });
export type ApplicationEmailFieldDto = z.infer<typeof applicationEmailFieldDtoSchema>;

// Allows building a list of entries, where each entry has all the fields defined in entryFields
export const applicationListFieldSchema = z.object({
  id: z.string().min(1).max(255),
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
export const applicationListFieldDtoSchema = applicationListFieldSchema.omit({ id: true });
export type ApplicationListFieldDto = z.infer<typeof applicationListFieldDtoSchema>;

// Displays as a ListSelect component, either multi- or single-select
export const applicationSelectFieldSchema = z.object({
  id: z.string().min(1).max(255),
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
export const applicationSelectFieldDtoSchema = applicationSelectFieldSchema.omit({ id: true });
export type ApplicationSelectFieldDto = z.infer<typeof applicationSelectFieldDtoSchema>;

export const applicationFieldSchema = z.union([
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

export const applicationFieldDtoSchema = z.union([
  applicationMarkdownFieldDtoSchema,
  applicationDividerFieldDtoSchema,
  applicationTextFieldDtoSchema,
  applicationTextAreaFieldDtoSchema,
  applicationUrlFieldDtoSchema,
  applicationEmailFieldDtoSchema,
  applicationListFieldDtoSchema,
  applicationSelectFieldDtoSchema,
]);
export type ApplicationFieldDto = z.infer<typeof applicationFieldDtoSchema>;

const applicationFormFields = z.array(applicationFieldSchema).max(50);
export type ApplicationFormFields = z.infer<typeof applicationFormFields>;

export const applicationFormSchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  fields: applicationFormFields,
});
export type ApplicationForm = z.infer<typeof applicationFormSchema>;

export const createApplicationFormDtoSchema = z.object({
  name: z.string().min(1).max(255),
  fields: applicationFormFields,
});
export type CreateApplicationFormDto = z.infer<typeof createApplicationFormDtoSchema>;

export type ApplicationUrlAnswer = {
  type: 'url';
  fieldId: string;
  field: ApplicationUrlField;
  url: string;
};
export const applicationUrlAnswerSchema = z.object({
  type: z.literal('url'),
  fieldId: z.string().min(1).max(255),
  field: applicationUrlFieldDtoSchema,
  url: z.string().max(2000).url(),
});
export const applicationUrlAnswerDtoSchema = z.object({
  fieldId: z.string().min(1).max(255),
  value: z.string().max(2000).url(),
});
export type ApplicationUrlAnswerDto = z.infer<typeof applicationUrlAnswerDtoSchema>;

export type ApplicationTextAnswer = {
  type: 'text';
  fieldId: string;
  field: ApplicationTextField | ApplicationTextAreaField;
  text: string;
};
export const applicationTextAnswerSchema = z.object({
  type: z.union([z.literal('text'), z.literal('textarea')]),
  fieldId: z.string().min(1).max(255),
  field: z.union([applicationTextFieldDtoSchema, applicationTextAreaFieldDtoSchema]),
  text: z.string().max(10000),
});
export const applicationTextAnswerDtoSchema = z.object({
  fieldId: z.string().min(1).max(255),
  value: z.string().max(10000),
});
export type ApplicationTextAnswerDto = z.infer<typeof applicationTextAnswerDtoSchema>;

export type ApplicationEmailAnswer = {
  type: 'email';
  fieldId: string;
  field: ApplicationEmailField;
  email: string;
};
export const applicationEmailAnswerSchema = z.object({
  type: z.literal('email'),
  fieldId: z.string().min(1).max(255),
  field: applicationEmailFieldDtoSchema,
  email: z.string().max(255).email(),
});
export const applicationEmailAnswerDtoSchema = z.object({
  fieldId: z.string().min(1).max(255),
  value: z.string().max(255).email(),
});
export type ApplicationEmailAnswerDto = z.infer<typeof applicationEmailAnswerDtoSchema>;

export type ApplicationListAnswer = {
  type: 'list';
  fieldId: string;
  field: ApplicationListField;
  entries: Record<string, string | number>[];
};
export const applicationListAnswerSchema = z.object({
  type: z.literal('list'),
  fieldId: z.string().min(1).max(255),
  field: applicationListFieldDtoSchema,
  entries: z.array(z.record(z.union([z.string().max(1000), z.number()]))).max(100),
});
export const applicationListAnswerDtoSchema = z.object({
  fieldId: z.string().min(1).max(255),
  value: z.array(z.record(z.union([z.string().max(1000), z.number()]))).max(100),
});
export type ApplicationListAnswerDto = z.infer<typeof applicationListAnswerDtoSchema>;

export type ApplicationSelectAnswer = {
  type: 'select';
  fieldId: string;
  field: ApplicationSelectField;
  selected: string[];
};
export const applicationSelectAnswerSchema = z.object({
  type: z.literal('select'),
  fieldId: z.string().min(1).max(255),
  field: applicationSelectFieldDtoSchema,
  selected: z.array(z.string().min(1).max(255)).max(100),
});
export const applicationSelectAnswerDtoSchema = z.object({
  fieldId: z.string().min(1).max(255),
  value: z.array(z.string().min(1).max(255)).max(100),
});
export type ApplicationSelectAnswerDto = z.infer<typeof applicationSelectAnswerDtoSchema>;

export type ApplicationAnswer =
  | ApplicationUrlAnswer
  | ApplicationTextAnswer
  | ApplicationEmailAnswer
  | ApplicationListAnswer
  | ApplicationSelectAnswer;

export const applicationAnswerSchema = z.union([
  applicationUrlAnswerSchema,
  applicationTextAnswerSchema,
  applicationEmailAnswerSchema,
  applicationListAnswerSchema,
  applicationSelectAnswerSchema,
]);

export const applicationAnswerDtoSchema = z.array(
  z.union([
    applicationUrlAnswerDtoSchema,
    applicationTextAnswerDtoSchema,
    applicationEmailAnswerDtoSchema,
    applicationListAnswerDtoSchema,
    applicationSelectAnswerDtoSchema,
  ]),
);
export type ApplicationAnswerDto = z.infer<typeof applicationAnswerDtoSchema>;

export const createApplicationDtoSchema = z.object({
  projectName: z.string().min(1).max(255),
  dripsAccountId: z.string().min(1).max(255),
  attestationUID: z.string().min(1).max(255).optional(),
  categoryId: z.string().min(1).max(255),
  answers: applicationAnswerDtoSchema,
});
export type CreateApplicationDto = z.infer<typeof createApplicationDtoSchema>;

export type ApplicationEasAttestationData = CreateApplicationDto & {
  categoryName: string;
  roundName: string;
};

export const applicationStateSchema = z.enum(['pending', 'approved', 'rejected']);
export type ApplicationState = z.infer<typeof applicationStateSchema>;

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

export type ProjectData = ProjectChainData & {
  gitHubUrl: string;
};

export const createApplicationCategoryDtoSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  applicationFormId: z.string().min(1).max(255),
});
export type CreateApplicationCategoryDto = z.infer<typeof createApplicationCategoryDtoSchema>;

export const updateApplicationCategoryDtoSchema = createApplicationCategoryDtoSchema;
export type UpdateApplicationCategoryDto = z.infer<typeof updateApplicationCategoryDtoSchema>;

export const applicationCategorySchema = z.object({
  id: z.string().min(1).max(255),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable(),
  applicationForm: z.object({
    id: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
  }),
});
export type ApplicationCategory = z.infer<typeof applicationCategorySchema>;

export const applicationVersionSchema = z.object({
  id: z.string(),
  projectName: z.string().min(1),
  dripsAccountId: z.string().min(1).max(255),
  easAttestationUID: z.string().min(1).max(255).nullable(),
  dripsProjectDataSnapshot: projectChainDataSchema,
  formId: z.string().min(1).max(255),
  category: applicationCategorySchema,
  answers: applicationAnswerSchema.array(),
  createdAt: z.string().pipe(z.coerce.date()),
});
export type ApplicationVersion = z.infer<typeof applicationVersionSchema>;

export const applicationSchema = z.object({
  id: z.string(),
  state: applicationStateSchema,
  createdAt: z.string().pipe(z.coerce.date()),
  updatedAt: z.string().pipe(z.coerce.date()),
  roundId: z.string(),
  allocation: z.number().nullable(),
  submitter: userSchema,
  projectName: z.string().min(1).max(255),
  dripsProjectDataSnapshot: projectChainDataSchema,
  latestVersion: applicationVersionSchema,
});
export type Application = z.infer<typeof applicationSchema>;

export const applicationReviewDtoSchema = z.array(
  z.object({
    applicationId: z.string(),
    decision: z.enum(['approve', 'reject']),
  }),
);
export type ApplicationReviewDto = z.infer<typeof applicationReviewDtoSchema>;

export const listingApplicationSchema = z.object({
  id: z.string(),
  state: applicationStateSchema,
  projectName: z.string().min(1).max(255),
  dripsProjectDataSnapshot: projectChainDataSchema,
  allocation: z.number().nullable(),
});
export type ListingApplication = z.infer<typeof listingApplicationSchema>;

export type UpdateApplicationDto = {
  projectName: string;
  dripsAccountId: string;
  attestationUID?: string;
  categoryId: string;
  answers: ApplicationAnswerDto;
};

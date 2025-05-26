import type { CreateRoundDto } from './schemas';

export const DEFAULT_PRESET: CreateRoundDto['applicationFormat'] = [
  {
    type: 'markdown',
    content:
      '# Welcome to my RPGF round!\n\nThis is a test round. Please fill out the application form below.',
  },
  {
    type: 'divider',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'description',
    label: 'Project Description',
    descriptionMd:
      'Please **consicely** describe your project. This will be used to evaluate your application.',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'legal-name',
    label: 'Legal Name',
    descriptionMd: 'Please enter your name.',
  },
  {
    type: 'email',
    private: true,
    required: true,
    slug: 'email',
    label: 'Email',
    descriptionMd: 'Please enter your email address.',
  },
  {
    type: 'url',
    private: false,
    required: true,
    slug: 'website',
    label: 'Website',
    descriptionMd: 'Please enter the URL to your website.',
  },
];

// TODO(rpgf): Real Filecoin form
export const FILECOIN_PRESET: CreateRoundDto['applicationFormat'] = [
  {
    type: 'markdown',
    content:
      '# Welcome to Filecoin RPGF round!\n\nThis is a test round. Please fill out the application form below.',
  },
  {
    type: 'divider',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'description',
    label: 'Project Description',
    descriptionMd:
      'Please **consicely** describe your project. This will be used to evaluate your application.',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'legal-name',
    label: 'Legal Name',
    descriptionMd: 'Please enter your name.',
  },
  {
    type: 'email',
    private: true,
    required: true,
    slug: 'email',
    label: 'Email',
    descriptionMd: 'Please enter your email address.',
  },
  {
    type: 'url',
    private: false,
    required: true,
    slug: 'website',
    label: 'Website',
    descriptionMd: 'Please enter the URL to your website.',
  },
];

export function matchPreset(
  applicationFormat: CreateRoundDto['applicationFormat'],
): { slug: string; name: string } | undefined {
  return PRESETS.find(
    (p) => JSON.stringify(p.applicationFormat) === JSON.stringify(applicationFormat),
  );
}

export function getPresetBySlug(
  slug: string,
):
  | { applicationFormat: CreateRoundDto['applicationFormat']; slug: string; name: string }
  | undefined {
  return PRESETS.find((p) => p.slug === slug);
}

export const PRESETS: {
  applicationFormat: CreateRoundDto['applicationFormat'];
  slug: string;
  name: string;
}[] = [
  {
    applicationFormat: DEFAULT_PRESET,
    slug: 'default',
    name: 'Default',
  },
  {
    applicationFormat: FILECOIN_PRESET,
    slug: 'filecoin',
    name: 'Filecoin',
  },
];

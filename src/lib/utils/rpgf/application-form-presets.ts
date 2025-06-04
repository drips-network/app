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
    content: '# FIL-RPGF Application Intake Form',
  },
  {
    type: 'markdown',
    content:
      '## Submitter Information (Private)\nThis information will be used to notify successful applicants, and as KYC for successful applicants. It will not be shared publicly.',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'legal_company_individual_name',
    label: 'Legal Company/Individual Name',
    descriptionMd: 'The name of the company or individual expected to receive the funds',
  },
  {
    type: 'text',
    private: true,
    required: true,
    slug: 'poc_name',
    label: 'Point of Contact (POC) Name',
    descriptionMd: 'The individual we can contact regarding the application',
  },
  {
    type: 'textarea',
    private: true,
    required: true,
    slug: 'postal_address',
    label: 'Postal address',
    descriptionMd: 'The postal address of the individual or entity expected to receive funds',
  },
  {
    type: 'email',
    private: true,
    required: true,
    slug: 'email_address',
    label: 'Email address',
    descriptionMd: 'The address through which round operators may contact the applicant',
  },
  {
    type: 'text',
    private: true,
    required: false,
    slug: 'filecoin_slack_username_poc',
    label: 'Filecoin Slack Username of POC',
    descriptionMd:
      'Optional, in case email is non-responsive and the round operators need to get in touch',
  },
  {
    type: 'text',
    private: true,
    required: false,
    slug: 'discord_filecoin_username_poc',
    label: 'Discord Filecoin Username of POC',
    descriptionMd:
      'Optional, in case email is non-responsive and the round operators need to get in touch',
  },
  {
    type: 'divider',
  },
  {
    type: 'markdown',
    content:
      '## Application (Public)\nThis information will be used to create your public application profile. A link to the metadata will be attested to on Filecoin.',
  },
  {
    type: 'markdown',
    content: '### Application Profile',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'project_description',
    label: 'Description of your project',
    descriptionMd:
      'Brief project description up to 100 words. This will be visible on the website and will be one of the first things reviewers look at. Make it descriptive and engaging.',
  },
  {
    type: 'url',
    private: false,
    required: true,
    slug: 'project_website',
    label: 'Website for your project',
    descriptionMd: 'https://yourproject.com',
  },
  {
    type: 'divider',
  },
  {
    type: 'markdown',
    content: '### Contribution & Impact',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'contribution_impact_summary',
    label: 'Describe the contribution and impact of your project.',
    descriptionMd:
      'Use the following questions as inspiration to help you describe your project’s impact. You don’t have to answer all questions, and you can illustrate impact as you best feel fits. Important: be as succinct and clear as possible.',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'end_user_benefit',
    label: 'Who is the end user that benefits from the project?',
    descriptionMd: 'Identifying who the project impacts',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'positive_reviews_testimonials',
    label: 'Positive reviews/testimonials',
    descriptionMd:
      'What are the number of positive reviews/testimonials that your project has received from developers in the Filecoin Ecosystem?',
  },
  {
    type: 'url',
    private: false,
    required: false,
    slug: 'testimonials_link',
    label: 'Link to testimonials',
    descriptionMd: 'Please share a link to these testimonials, if applicable.',
  },
  {
    type: 'select',
    private: false,
    required: true,
    slug: 'impact_category',
    label: 'Select the impact category that best describes your project/contributions.',
    options: [
      {
        label: 'Infrastructure & Dependencies',
        value: 'infrastructure_dependencies',
      },
      { label: 'Tooling & Utilities', value: 'tooling_utilities' },
      { label: 'Education & Outreach', value: 'education_outreach' },
      {
        label: 'Protocol Research & Development',
        value: 'protocol_research_development',
      },
      { label: 'Collective Governance', value: 'collective_governance' },
      { label: 'Products & End User UX', value: 'products_end_user_ux' },
    ],
    allowMultiple: false,
  },
  {
    type: 'markdown',
    content:
      '#### Category Specific Questions\nUse the questions relevant to your selected category from the list below to provide insights into the impact your project made during the impact window [April 2024-September 2024] since the last round. This is how we recommend you break down your answer for contributions and impact. It is likely not all questions are applicable to your project, and you may have different avenues of impact. Please be as specific and succinct as possible when answering.',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'category_specific_impact_details',
    label: 'Category Specific Impact Details',
    descriptionMd:
      '**Infrastructure & Dependencies**\n- Please include your oso_name, if you don’t have one please follow this process [link] to get it.\n- Name the top 5 high-impact projects dependent on your library/repository.\n- What is the percentage of Filecoin users (or percentage of the network) that run on your implementation?\n- How has your project contributed to growing the Filecoin economy? For example, what volume of FIL-denominated transactions does your library support. [If possible, provide a numerical estimate]\n- Any additional impact you feel your project has made, that is not covered through your earlier answers.*\n\n**Tooling & Utilities**\n- Please include your oso_name, if you don’t have one please follow this process [link] to get it.\n- How many FVM projects are dependent on your project? Name the top 5 high-impact projects dependent on your tool.\n- How many times has an SDK or package developed by your project been downloaded?\n- How has your project contributed to growing the Filecoin economy? For example, what volume of FIL-denominated transactions has it supported. [If possible, provide a numerical estimate]\n- Any additional impact you feel your project has made, that is not covered through your earlier answers.*\n\n**Education & Outreach**\n- What is the increase in the number of first-time Filecoin addresses as a result of your educational content?\n- What is the total number of impressions your content has received? What is the feedback score you have received?\n- What is the number of people graduating from your program / What is the number of people who attended your event?\n- What is the increase in the number of active developer users as a result of your educational content?\n- How has your project contributed to growing the Filecoin economy? For example, what volume of FIL-denominated transactions has it enabled. [If possible, provide a numerical estimate and a link]\n- Any additional impact you feel your project has made, that is not covered through your earlier answers.*\n\n**Protocol Research & Development**\n- What is the number of projects that are dependent on the core Filecoin Protocol Code/Mechanisms that your project has built?\n- How has your research improved usability or infrastructure, for example, the response to a public Filecoin Mainnet RPC call?\n- What is the increase in efficiency for storage data as a result of your work? For example, a reduction in sealing costs.\n- How much improvement in system performance has Filecoin seen as a result of your work?\n- Any additional impact you feel your project has made, that is not covered through your earlier answers.*\n\n**Collective Governance**\n- How has your project made governance more accessible to more members of the Filecoin ecosystem?\n- Other*\n\n**Products & End User UX**\n- Please share 1-3 user case studies\n- What is the increase in Filecoin wallet interactions during the impact window as a result of your project?\n- What is the average number of users retained upon interacting with your application for the first time?\n- What is the number of returning unique transacting addresses per project?\n- What is the increase in interactions with a project derived from this contribution?\n- What is the growth in the number of monthly active addresses interacting with your project?\n- What is the number of new addresses that have been funded as a result of a contribution?\n- How has your project contributed to growing the Filecoin economy? For example, what volume of FIL-denominated transactions has it supported. [If possible, provide a numerical estimate]\n- Any additional impact you feel your project has made, that is not covered through your earlier answers.*',
  },
  {
    type: 'markdown',
    content:
      '### Impact metrics\n(Use OSO to generate high level numbers). OSO - stars, forks, age of repo / project, # contributors, # releases. Needs to be communicated to badgeholders that some teams are new vs some teams use it consistently. Might be category specific (more meaningful for some categories vs others). Can expose an API to OSO so they can get access to this.',
  },
  {
    type: 'url',
    private: false,
    required: false,
    slug: 'oso_metrics_link',
    label: 'Link to OSO / Impact Metrics Dashboard',
    descriptionMd: 'Provide a link related to your OSO metrics (e.g., profile, dashboard).',
  },
  {
    type: 'textarea',
    private: false,
    required: false,
    slug: 'key_impact_numbers_text',
    label: 'Key Impact Numbers (from OSO or other sources)',
    descriptionMd:
      'Provide key quantitative impact metrics (e.g., from OSO: stars, forks, # contributors, # releases, or other relevant numbers).',
  },
  {
    type: 'list',
    private: false,
    slug: 'contribution_links',
    required: true,
    label: 'Contribution Links',
    descriptionMd:
      'Provide 1-5 links that best demonstrate the impact of your contributions to the Filecoin Ecosystem.',
    maxItems: 5,
    entryFields: [
      { type: 'text', label: 'Description' },
      { type: 'url', label: 'URL' },
    ],
  },
  {
    type: 'divider',
  },
  {
    type: 'markdown',
    content: '### Team Composition',
  },
  {
    type: 'textarea',
    private: false,
    required: true,
    slug: 'team_composition_description',
    label: 'Team Size and Subgroups',
    descriptionMd: 'Briefly describe your team size and subgroups.',
  },
  {
    type: 'divider',
  },
  {
    type: 'markdown',
    content: '### Social Media',
  },
  {
    type: 'url',
    private: false,
    required: true,
    slug: 'showcase_twitter_x_post_link',
    label: 'Showcase Twitter/X Post Link',
    descriptionMd:
      'Please share a link to the Twitter/X post you created as part of the showcase phase. (If you have not created one, please feel free to make one at the earliest tagging the FIL-RetroPGF team).',
  },
  {
    type: 'divider',
  },
  {
    type: 'markdown',
    content:
      '## Additional Information (Private) (optional)\nThe following information will be used to better understand applicants, and will be used by the Operations team to better understand the result of RetroPGF rounds. This information is private and will not be visible to badgeholders. Any information submitted here will have no impact on the outcome of the application.',
  },
  {
    type: 'markdown',
    content: '### Funding sources',
  },
  {
    type: 'textarea',
    private: true,
    required: false,
    slug: 'primary_funding_sources_description',
    label: 'Primary Sources of Funding',
    descriptionMd:
      'Primary Sources of funding for this project (not including previous FIL-RetroPGF rounds)?',
  },
  {
    type: 'select',
    private: true,
    required: false,
    slug: 'total_funding_received_amount',
    label: 'Total Funding Received (Estimates)',
    descriptionMd: 'How much have you received in total (estimates are okay)',
    options: [
      { label: 'Greater than $1M USD', value: 'gt_1M_usd' },
      { label: '1M - 500K USD', value: '1M_500K_usd' },
      { label: '500K - 250K USD', value: '500K_250K_usd' },
      { label: '250K - 100K USD', value: '250K_100K_usd' },
      { label: '100K - 10K USD', value: '100K_10K_usd' },
      { label: '10K-1K USD', value: '10K_1K_usd' },
      { label: 'Less than 1K USD', value: 'lt_1K_usd' },
    ],
    allowMultiple: false,
  },
  {
    type: 'select',
    private: true,
    required: false,
    slug: 'previously_applied_fil_retropgf',
    label: 'Previously Applied to FIL-RetroPGF',
    descriptionMd: 'Have you previously applied to FIL-RetroPGF rounds (regardless of outcome)?',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'No', value: 'no' },
    ],
    allowMultiple: false,
  },
  {
    type: 'url',
    private: true,
    required: false,
    slug: 'previous_application_link',
    label: 'Link to Previous Application(s)',
    descriptionMd:
      'If Yes, please insert a link to your most recent previous application page(s) here.',
  },
];

export function matchPreset(
  applicationFormat: CreateRoundDto['applicationFormat'],
): { slug: string; name: string } | undefined {
  return PRESETS.find(
    (p) => JSON.stringify(p.applicationFormat) === JSON.stringify(applicationFormat),
  );
}

export function getPresetBySlug(slug: string):
  | {
      applicationFormat: CreateRoundDto['applicationFormat'];
      slug: string;
      name: string;
    }
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

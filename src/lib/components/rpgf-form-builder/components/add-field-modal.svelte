<script lang="ts">
  import modal from '$lib/stores/modal';
  import type { ApplicationFieldDto } from '$lib/utils/rpgf/types/application';
  import FieldSettingsModal from './field-settings-modal.svelte';

  export let onAdd: (field: ApplicationFieldDto) => void;
  export let unavailableSlugs: string[];

  const DEFAULT_FIELD_SETTINGS: Record<ApplicationFieldDto['type'], ApplicationFieldDto> = {
    markdown: {
      type: 'markdown',
      content: '',
    },
    divider: {
      type: 'divider',
    },
    text: {
      type: 'text',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
    },
    textarea: {
      type: 'textarea',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
    },
    url: {
      type: 'url',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
    },
    email: {
      type: 'email',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
    },
    select: {
      type: 'select',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
      options: [],
    },
    list: {
      type: 'list',
      descriptionMd: '',
      label: '',
      slug: '',
      required: false,
      private: false,
      entryFields: [],
      maxItems: 0,
    },
  } as const;

  const FIELD_TYPES: Record<
    ApplicationFieldDto['type'],
    { friendlyName: string; description: string }
  > = {
    markdown: {
      friendlyName: 'Markdown Content',
      description: 'Display a block of Markdown content, such as instructions or information.',
    },
    divider: {
      friendlyName: 'Divider',
      description: 'A visual divider to separate sections of the form.',
    },
    text: {
      friendlyName: 'Text Field',
      description: 'A single-line text input field.',
    },
    textarea: {
      friendlyName: 'Text Area',
      description: 'A multi-line text input field.',
    },
    url: {
      friendlyName: 'URL Field',
      description: 'A field for entering a URL.',
    },
    email: {
      friendlyName: 'Email Field',
      description: 'A field for entering an email address.',
    },
    select: {
      friendlyName: 'Select Field',
      description: 'A single-choice select field with predefined options.',
    },
    list: {
      friendlyName: 'List Field',
      description:
        'A field for entering a list of items, each with its own customizable set of fields.',
    },
  } as const;

  function handleAdd(type: string) {
    const defaultSettings = DEFAULT_FIELD_SETTINGS[type as ApplicationFieldDto['type']];

    if (type === 'divider') {
      onAdd(defaultSettings);
      return modal.hide();
    }

    modal.show(FieldSettingsModal, undefined, {
      fieldSettings: defaultSettings,
      onSave: (field) => {
        onAdd(field);
        modal.hide();
      },
      unavailableSlugs,
    });
  }
</script>

<div class="add-field-modal">
  {#each Object.entries(FIELD_TYPES) as [type, { friendlyName, description }]}
    <button class="option" on:click={() => handleAdd(type)}>
      <span class="name typo-text-bold">{friendlyName}</span>
      <span class="description typo-text" style:color="var(--color-foreground-level-6)"
        >{description}</span
      >
    </button>
  {/each}
</div>

<style>
  .add-field-modal {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .option {
    background: var(--color-background);
    text-align: left;
    border: 1px solid var(--color-foreground-level-4);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .option:hover,
  .option:focus-visible {
    background: var(--color-primary-level-1);
  }
</style>

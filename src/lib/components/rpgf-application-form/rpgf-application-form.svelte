<script lang="ts">
  import type { ApplicationFormat } from '$lib/utils/rpgf/schemas';
  import DividerField from './components/divider-field.svelte';
  import EmailField from './components/email-field.svelte';
  import ListField from './components/list-field.svelte';
  import MarkdownField from './components/markdown-field.svelte';
  import SelectField from './components/select-field.svelte';
  import TextAreaField from './components/text-area-field.svelte';
  import TextField from './components/text-field.svelte';
  import UrlField from './components/url-field.svelte';

  export let applicationFormat: ApplicationFormat;
  export let disabled = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let data: Record<string, any> = {};

  let fieldsValidStates: Record<string, boolean> = {};

  export let valid = false;
  $: valid = Object.values(fieldsValidStates).every((v) => v);
</script>

<form class:disabled>
  {#each applicationFormat as applicationField}
    {@const type = applicationField.type}

    {#if type === 'divider'}
      <DividerField />
    {:else if type === 'markdown'}
      <MarkdownField field={applicationField} />
    {:else if type === 'list'}
      <ListField field={applicationField} bind:value={data[applicationField.slug]} />
    {:else if type === 'select'}
      <SelectField
        field={applicationField}
        bind:value={data[applicationField.slug]}
        bind:valid={fieldsValidStates[applicationField.slug]}
      />
    {:else if type === 'text'}
      <TextField
        field={applicationField}
        bind:value={data[applicationField.slug]}
        bind:valid={fieldsValidStates[applicationField.slug]}
      />
    {:else if type === 'textarea'}
      <TextAreaField
        field={applicationField}
        bind:value={data[applicationField.slug]}
        bind:valid={fieldsValidStates[applicationField.slug]}
      />
    {:else if type === 'url'}
      <UrlField
        field={applicationField}
        bind:value={data[applicationField.slug]}
        bind:valid={fieldsValidStates[applicationField.slug]}
      />
    {:else if type === 'email'}
      <EmailField
        field={applicationField}
        bind:value={data[applicationField.slug]}
        bind:valid={fieldsValidStates[applicationField.slug]}
      />
    {/if}
  {/each}
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    transition: opacity 0.3s;
  }

  form.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>

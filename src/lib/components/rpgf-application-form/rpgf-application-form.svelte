<script lang="ts">
  import type {
    ApplicationAnswerDto,
    ApplicationFormFields,
  } from '$lib/utils/rpgf/types/application';
  import DividerField from './components/divider-field.svelte';
  import EmailField from './components/email-field.svelte';
  import ListField from './components/list-field.svelte';
  import MarkdownField from './components/markdown-field.svelte';
  import SelectField from './components/select-field.svelte';
  import TextAreaField from './components/text-area-field.svelte';
  import TextField from './components/text-field.svelte';
  import UrlField from './components/url-field.svelte';

  export let fields: ApplicationFormFields;
  export let disabled = false;
  export let forceRevealErrors = false;

  export let answers: ApplicationAnswerDto = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let internalAnswers: Record<string, any> = answers.reduce(
    (acc, answer) => {
      acc[answer.fieldId] = answer;
      return acc;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    },
    {} as Record<string, any>,
  );

  $: {
    answers = Object.values(internalAnswers).filter((a) => a !== undefined);
  }

  let fieldsValidStates: Record<string, boolean> = {};

  export let valid = false;
  $: valid = Object.values(fieldsValidStates).every((v) => v);
</script>

<form class:disabled>
  {#each fields as applicationField}
    {@const type = applicationField.type}

    {#if type === 'divider'}
      <DividerField />
    {:else if type === 'markdown'}
      <MarkdownField field={applicationField} />
    {:else if type === 'list'}
      <ListField field={applicationField} bind:answer={internalAnswers[applicationField.id]} />
    {:else if type === 'select'}
      <SelectField
        field={applicationField}
        bind:answer={internalAnswers[applicationField.id]}
        bind:valid={fieldsValidStates[applicationField.id]}
      />
    {:else if type === 'text'}
      <TextField
        forceRevealError={forceRevealErrors}
        field={applicationField}
        bind:answer={internalAnswers[applicationField.id]}
        bind:valid={fieldsValidStates[applicationField.id]}
      />
    {:else if type === 'textarea'}
      <TextAreaField
        forceRevealError={forceRevealErrors}
        field={applicationField}
        bind:answer={internalAnswers[applicationField.id]}
        bind:valid={fieldsValidStates[applicationField.id]}
      />
    {:else if type === 'url'}
      <UrlField
        forceRevealError={forceRevealErrors}
        field={applicationField}
        bind:answer={internalAnswers[applicationField.id]}
        bind:valid={fieldsValidStates[applicationField.id]}
      />
    {:else if type === 'email'}
      <EmailField
        forceRevealError={forceRevealErrors}
        field={applicationField}
        bind:answer={internalAnswers[applicationField.id]}
        bind:valid={fieldsValidStates[applicationField.id]}
      />
    {/if}
  {/each}
</form>

<style>
  form {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 3rem;
    transition: opacity 0.3s;
  }

  form.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
</style>

<script lang="ts" context="module">
  import type { Items, Weights } from '$lib/components/list-editor/types';

  export interface DripListConfig {
    items: Items;
    weights: Weights;
    title: string;
    description: string | undefined;
  }
</script>

<script lang="ts">
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import TextArea from '../text-area/text-area.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import type { AddItemError } from '../list-editor/errors';
  import CustodialWarning from '../annotation-box/custodial-warning.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';

  export let name: string;
  export let description: string | undefined;
  export let items: Items;
  export let weights: Weights;

  export let urlToAdd: string | undefined = undefined;

  export let isHidden: boolean;

  let recipientErrors: AddItemError[] = [];

  let listValid = false;
  $: titleValid = name.length > 0;
  $: descriptionValid = textAreaValidationState.type === 'valid';

  export let isValid = false;
  $: isValid = listValid && titleValid && descriptionValid;

  let textAreaValidationState: TextInputValidationState;
  $: textAreaValidationState = !description
    ? { type: 'valid' }
    : description.length >= 1000
      ? { type: 'invalid', message: `Cannot exceed ${Number(1000).toLocaleString()} characters.` }
      : /<[^>]+>/gi.test(description)
        ? { type: 'invalid', message: 'HTML currently not allowed.' }
        : { type: 'valid' };
</script>

<section class="flex flex-col gap-8">
  <FormField title="Title*">
    <TextInput bind:value={name} />
  </FormField>

  <FormField title="Description">
    <TextArea bind:value={description} resizable={true} validationState={textAreaValidationState} />
  </FormField>

  <CustodialWarning dismissableId="custodial-warning-drip-list" />
  <FormField title="Recipients*">
    <ListEditor
      bind:weights
      bind:items
      bind:valid={listValid}
      bind:inputErrors={recipientErrors}
      on:errorDismissed={() => (recipientErrors = [])}
      addOnMount={urlToAdd}
    />
    <svelte:fragment slot="action">
      <slot name="list-editor-action" />
    </svelte:fragment>
  </FormField>

  <div class="visibility-toggle">
    <h4>Hide this list from my profile</h4>
    <Toggle bind:checked={isHidden} />
  </div>
</section>

<style>
  .visibility-toggle {
    display: flex;
    justify-content: space-between;
  }
</style>

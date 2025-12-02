<script lang="ts" module>
  import type { Items, Weights } from '$lib/components/list-editor/types';

  export interface DripListConfig {
    items: Items;
    weights: Weights;
    title: string;
    description: string | undefined;
  }
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import TextArea from '../text-area/text-area.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import type { AddItemError } from '../list-editor/errors';
  import CustodialWarning from '../annotation-box/custodial-warning.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';

  let recipientErrors: AddItemError[] = $state([]);

  let listValid = $state(false);

  interface Props {
    name: string;
    description: string | undefined;
    items: Items;
    weights: Weights;
    urlToAdd?: string | undefined;
    isVisible: boolean;
    isValid?: boolean;
    list_editor_action?: import('svelte').Snippet;
  }

  let {
    name = $bindable(),
    description = $bindable(),
    items = $bindable(),
    weights = $bindable(),
    urlToAdd = undefined,
    isVisible = $bindable(),
    isValid = $bindable(false),
    list_editor_action,
  }: Props = $props();

  let textAreaValidationState: TextInputValidationState = $derived(
    !description
      ? { type: 'valid' }
      : description.length >= 1000
        ? { type: 'invalid', message: `Cannot exceed ${Number(1000).toLocaleString()} characters.` }
        : /<[^>]+>/gi.test(description)
          ? { type: 'invalid', message: 'HTML currently not allowed.' }
          : { type: 'valid' },
  );
  let titleValid = $derived(name.length > 0);

  let descriptionValid = $derived(textAreaValidationState.type === 'valid');
  run(() => {
    isValid = listValid && titleValid && descriptionValid;
  });
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
    {#snippet action()}
      {@render list_editor_action?.()}
    {/snippet}
  </FormField>

  <FormField type="div" title="Visibility">
    <div class="visibility-toggle">
      <div style="display: flex; gap: 0.5rem;">
        <p>Show this Drip List on my profile</p>
        <a
          style="text-decoration: underline; display: inline;"
          target="_blank"
          href="https://docs.drips.network/advanced/drip-list-and-project-visibility">Learn more</a
        >
      </div>
      <Toggle bind:checked={isVisible} />
    </div>
  </FormField>
</section>

<style>
  .visibility-toggle {
    display: flex;
    justify-content: space-between;
  }
</style>

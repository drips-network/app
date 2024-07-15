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

  export let dripList: DripListConfig = {
    title: 'My Drip List',
    weights: {},
    items: {},
    description: undefined,
  };
  export let urlToAdd: string | undefined = undefined;

  // validation
  let listValid = false;
  $: titleValid = dripList.title.length > 0;
  $: descriptionValid = textAreaValidationState.type === 'valid';

  export let isValid = false;
  $: isValid = listValid && titleValid && descriptionValid;

  let textAreaValidationState: TextInputValidationState;
  $: textAreaValidationState = !dripList.description
    ? { type: 'valid' }
    : dripList.description.length >= 1000
      ? { type: 'invalid', message: `Cannot exceed ${Number(1000).toLocaleString()} characters.` }
      : /<[^>]+>/gi.test(dripList.description)
        ? { type: 'invalid', message: 'HTML currently not allowed.' }
        : { type: 'valid' };
</script>

<section class="flex flex-col gap-8">
  <FormField title="Title*">
    <TextInput bind:value={dripList.title} />
  </FormField>

  <FormField title="Description">
    <TextArea
      bind:value={dripList.description}
      resizable={true}
      validationState={textAreaValidationState}
    />
  </FormField>

  <FormField title="Recipients*">
    <ListEditor
      bind:weights={dripList.weights}
      bind:items={dripList.items}
      bind:valid={listValid}
      addOnMount={urlToAdd}
    />
  </FormField>
</section>

<script lang="ts" context="module">
  export interface DripListConfig {
    items: Items;
    percentages: Percentages;
    title: string;
    description: string | undefined;
  }
</script>

<script lang="ts">
  import type {
    Items,
    Percentages,
  } from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
  import ListEditor from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
  import FormField from '../form-field/form-field.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import TextArea from '../text-area/text-area.svelte';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';

  export let dripList: DripListConfig = {
    title: 'My Drip List',
    percentages: {},
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

  <FormField title="Members*">
    <!-- TODO: This crashes when entering some non-valid github url -->
    <ListEditor
      bind:percentages={dripList.percentages}
      bind:items={dripList.items}
      bind:valid={listValid}
      addOnMount={urlToAdd}
    />
  </FormField>
</section>

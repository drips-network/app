<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ApplicationListField } from '$lib/utils/rpgf/schemas';
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';

  export let formFields: ApplicationListField['entryFields'];
  export let addToValuesFn: (item: Record<string, string | number>) => void;

  let values: Record<string, string | number> = {};

  function handleAddItem() {
    addToValuesFn(values);
    modal.hide();
  }

  $: filledOut = formFields.every((field) => {
    const value = values[field.label];
    const type = field.type;

    if (type === 'number') {
      return value !== undefined && value.toString().trim() !== '' && !isNaN(Number(value));
    }

    if (type === 'url') {
      return (
        value !== undefined &&
        value.toString().trim() !== '' &&
        /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value.toString().trim())
      );
    }

    return value !== undefined && value.toString().trim() !== '';
  });
</script>

<div class="modal">
  {#each formFields as field}
    <FormField title={field.label + '*'}>
      <TextInput
        bind:value={values[field.label]}
        variant={field.type === 'number' ? { type: 'number', min: 0 } : undefined}
      />
    </FormField>
  {/each}
  <Button disabled={!filledOut} variant="primary" on:click={handleAddItem}>Add Item</Button>
</div>

<style>
  .modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>

<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Button from '$lib/components/button/button.svelte';
  import modal from '$lib/stores/modal';
  import type { ApplicationListField } from '$lib/utils/rpgf/types/application';

  interface Props {
    formFields: ApplicationListField['entryFields'];
    addToValuesFn: (item: Record<string, string | number>) => void;
  }

  let { formFields, addToValuesFn }: Props = $props();

  let values: Record<string, string | number> = $state({});

  function handleAddItem() {
    addToValuesFn(values);
    modal.hide();
  }

  let filledOut = $derived(
    formFields.every((field) => {
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
    }),
  );
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
  <Button disabled={!filledOut} variant="primary" onclick={handleAddItem}>Add Item</Button>
</div>

<style>
  .modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import modal from '$lib/stores/modal';
  import type { ApplicationListField } from '$lib/utils/rpgf/schemas';
  import ListFieldAddItemModal from './list-field-add-item-modal.svelte';

  export let field: ApplicationListField;
  export let forceRevealError: boolean | undefined = undefined;

  export let valid: boolean = false;
  export let value: Record<string, string | number>[] = [];

  function addToValues(item: Record<string, string | number>) {
    value = [...value, item];
  }

  function deleteValue(e: Event, index: number) {
    e.stopImmediatePropagation();
    value = value.filter((_, i) => i !== index);
  }

  function handleAddItem() {
    modal.show(ListFieldAddItemModal, undefined, {
      addToValuesFn: addToValues,
      formFields: field.entryFields,
    });
  }

  function asUrl(value: string | number | undefined): string {
    if (value === undefined || value === null) {
      return '';
    }

    return value.toString().trim();
  }
</script>

<!-- TODO(rpgf): Make pretty -->
<FormField
  type="div"
  title={field.label + (field.required ? '*' : '')}
  descriptionMd={field.descriptionMd}
  validationState={valid
    ? { type: 'valid' }
    : forceRevealError
      ? { type: 'invalid', message: 'Add at least one item.' }
      : { type: 'valid' }}
>
  <div class="values">
    {#each value as item (item)}
      <div class="item-card">
        <div class="fields">
          {#each field.entryFields as entryField (entryField.label)}
            {@const value = item[entryField.label]}
            <span
              class="value typo-text"
              class:typo-text-bold={field.entryFields.indexOf(entryField) === 0}
            >
              {value}
              {#if entryField.type === 'url'}
                <a href={asUrl(value)} target="_blank" rel="noopener noreferrer">
                  <ArrowBoxUpRight />
                </a>
              {/if}
            </span>
          {/each}
        </div>
        <Button
          variant="ghost"
          on:click={(e) => deleteValue(e, value.indexOf(item))}
          icon={Trash}
        />
      </div>
    {/each}
  </div>

  {#if value.length === 0}
    <p class="list-field-empty">No items added yet.</p>
  {/if}

  <Button on:click={handleAddItem} icon={Plus}>Add item</Button>
</FormField>

<style>
  .values {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .item-card {
    display: flex;
    gap: 1rem;
  }

  .item-card .fields {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .list-field-empty {
    color: var(--color-foreground-level-5);
    margin-bottom: 1rem;
  }

  .fields > span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>

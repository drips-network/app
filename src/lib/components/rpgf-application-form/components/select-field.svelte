<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import type { ApplicationSelectField } from '$lib/utils/rpgf/schemas';

  export let field: ApplicationSelectField;
  export let value: string | undefined = undefined;
  export let valid: boolean = false;
  export let forceRevealError: boolean | undefined = undefined;

  let items: Items;
  $: items = Object.fromEntries(
    field.options.map((option) => {
      return [
        option.value,
        {
          type: 'selectable',
          label: option.label,
        },
      ];
    }),
  );

  let beenFocussed = false;

  let selected: string[] = [];
  $: value = selected[0];

  $: {
    if (field.required) {
      valid = value !== undefined && value.trim() !== '';
    } else {
      valid = true;
    }
  }
</script>

<FormField
  title={field.label + (field.required ? '*' : '')}
  descriptionMd={field.descriptionMd}
  validationState={valid
    ? { type: 'valid' }
    : beenFocussed || forceRevealError
      ? { type: 'invalid', message: 'This field is required.' }
      : { type: 'valid' }}
>
  <div class="list">
    <ListSelect {items} searchable={false} />
  </div>
</FormField>

<style>
  .list {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>

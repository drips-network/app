<script lang="ts">
  import { run } from 'svelte/legacy';

  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import type {
    ApplicationSelectAnswerDto,
    ApplicationSelectField,
  } from '$lib/utils/rpgf/types/application';

  interface Props {
    field: ApplicationSelectField;
    answer?: ApplicationSelectAnswerDto | undefined;
    valid?: boolean;
    forceRevealError?: boolean | undefined;
    blockInteraction?: boolean;
  }

  let {
    field,
    answer = $bindable(),
    valid = $bindable(false),
    forceRevealError = undefined,
    blockInteraction = false,
  }: Props = $props();

  let items: Items = $derived(
    Object.fromEntries(
      field.options.map((option) => {
        return [
          option.value,
          {
            type: 'selectable',
            label: option.label,
          },
        ];
      }),
    ),
  );

  let beenFocussed = false;

  let selected: string[] = $state(answer ? [...(answer.value ?? [])] : []);
  run(() => {
    answer = {
      fieldId: field.id,
      value: selected,
    };
  });

  run(() => {
    if (field.required) {
      valid = answer !== undefined && (answer.value ?? []).length > 0;
    } else {
      valid = true;
    }
  });
</script>

<FormField
  title={field.label + (field.required ? '*' : '')}
  descriptionMd={field.descriptionMd}
  validationState={valid
    ? { type: 'valid' }
    : beenFocussed || forceRevealError
      ? { type: 'invalid', message: 'This field is required.' }
      : { type: 'valid' }}
  privateNoticeText={field.private
    ? 'Data in this field is private and will only be shared with the admins of the round.'
    : undefined}
>
  <div class="list">
    <ListSelect {blockInteraction} bind:selected {items} searchable={false} />
  </div>
</FormField>

<style>
  .list {
    border: 1px solid var(--color-foreground-level-4);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>

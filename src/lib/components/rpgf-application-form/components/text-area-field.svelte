<script lang="ts">
  import { run } from 'svelte/legacy';

  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import type {
    ApplicationTextAnswerDto,
    ApplicationTextAreaField,
  } from '$lib/utils/rpgf/types/application';

  interface Props {
    field: ApplicationTextAreaField;
    answer?: ApplicationTextAnswerDto | undefined;
    valid?: boolean;
    forceRevealError?: boolean | undefined;
  }

  let {
    field,
    answer = $bindable(),
    valid = $bindable(false),
    forceRevealError = undefined,
  }: Props = $props();

  let value: string | undefined = $state(answer?.value ?? undefined);
  run(() => {
    if (value) {
      answer = {
        fieldId: field.id,
        value: value,
      };
    } else {
      answer = undefined;
    }
  });

  run(() => {
    if (field.required) {
      valid = value !== undefined && value.trim() !== '' && value.length <= 10000;
    } else {
      valid = value == undefined || value.length <= 10000;
    }
  });

  let beenFocussed = $state(false);

  let tooLong = $derived(value != undefined && value.length > 10000);
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
  <TextArea bind:value resizable onblur={() => (beenFocussed = true)} />
  <div class="char-count">
    Markdown supported · <span class:too-long={tooLong}>{value ? value.length : 0} / 10.000</span>
  </div>
</FormField>

<style>
  .char-count {
    font-size: 0.875rem;
    color: var(--color-foreground-level-6);
    text-align: right;
    margin-top: 0.25rem;
  }

  .char-count .too-long {
    color: var(--color-negative);
  }
</style>

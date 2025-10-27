<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type {
    ApplicationTextAnswerDto,
    ApplicationTextField,
  } from '$lib/utils/rpgf/types/application';

  export let field: ApplicationTextField;
  export let answer: ApplicationTextAnswerDto | undefined = undefined;
  export let valid: boolean = false;
  export let forceRevealError: boolean | undefined = undefined;

  let value: string | undefined = answer?.value ?? undefined;
  $: if (value) {
    answer = {
      fieldId: field.id,
      value: value,
    };
  } else {
    answer = undefined;
  }

  $: {
    if (field.required) {
      valid = value !== undefined && value.trim() !== '' && value.length <= 5000;
    } else {
      valid = value == undefined || value.length <= 5000;
    }
  }

  let beenFocussed = false;

  $: tooLong = value != undefined && value.length > 5000;
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
  <TextInput bind:value on:blur={() => (beenFocussed = true)} />
  <div class="char-count">
    <span class:too-long={tooLong}>{value ? value.length : 0} / 5.000</span>
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

<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ApplicationEmailField } from '$lib/utils/rpgf/schemas';
  import type { ComponentProps } from 'svelte';

  export let field: ApplicationEmailField;
  export let value: string | undefined = undefined;
  export let valid: boolean = false;
  export let forceRevealError: boolean | undefined = undefined;

  $: hasValidEmail =
    value !== undefined && value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  $: {
    if (field.required) {
      valid = hasValidEmail;
    } else {
      valid = true;
    }
  }

  let beenFocussed = false;
  let formFieldValidationState: ComponentProps<FormField>['validationState'];
  $: formFieldValidationState = valid
    ? { type: 'valid' }
    : beenFocussed || forceRevealError
      ? { type: 'invalid', message: 'This field is required and must be a valid email address.' }
      : { type: 'valid' };
</script>

<FormField
  title={field.label + (field.required ? '*' : '')}
  descriptionMd={field.descriptionMd}
  validationState={formFieldValidationState}
  privateNoticeText={field.private
    ? 'Data in this field is private and will only be shared with the admins of the round.'
    : undefined}
>
  <TextInput bind:value on:blur={() => (beenFocussed = true)} />
</FormField>

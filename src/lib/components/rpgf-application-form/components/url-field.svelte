<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ApplicationUrlField } from '$lib/utils/rpgf/schemas';
  import type { ComponentProps } from 'svelte';

  export let field: ApplicationUrlField;
  export let value: string | undefined = undefined;
  export let valid: boolean = false;
  export let forceRevealError: boolean | undefined = undefined;

  function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  $: hasValidUrl = value !== undefined && value.trim() !== '' && isValidUrl(value);
  $: {
    if (field.required) {
      valid = hasValidUrl;
    } else {
      valid = true;
    }
  }

  let beenFocussed = false;
  let formFieldValidationState: ComponentProps<FormField>['validationState'];
  $: formFieldValidationState = valid
    ? { type: 'valid' }
    : beenFocussed || forceRevealError
      ? {
          type: 'invalid',
          message: 'This field is required and must be a full, valid URL, including https://.',
        }
      : { type: 'valid' };
</script>

<FormField
  title={field.label + (field.required ? '*' : '')}
  descriptionMd={field.descriptionMd}
  validationState={formFieldValidationState}
>
  <TextInput bind:value on:blur={() => (beenFocussed = true)} />
</FormField>

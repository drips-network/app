<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import type { ApplicationTextAreaField } from '$lib/utils/rpgf/schemas';

  export let field: ApplicationTextAreaField;
  export let value: string | undefined = undefined;
  export let valid: boolean = false;
  export let forceRevealError: boolean | undefined = undefined;

  $: {
    if (field.required) {
      valid = value !== undefined && value.trim() !== '';
    } else {
      valid = true;
    }
  }

  let beenFocussed = false;
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
  <TextArea bind:value resizable on:blur={() => (beenFocussed = true)} />
</FormField>

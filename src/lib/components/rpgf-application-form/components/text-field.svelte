<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ApplicationTextField } from '$lib/utils/rpgf/schemas';

  export let field: ApplicationTextField;
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
  privateNoticeText={field.private
    ? 'Data in this field is private and will only be shared with the admins of the round.'
    : undefined}
>
  <TextInput bind:value on:blur={() => (beenFocussed = true)} />
</FormField>

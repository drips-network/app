<script lang="ts">
  import { run } from 'svelte/legacy';

  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type {
    ApplicationUrlAnswerDto,
    ApplicationUrlField,
  } from '$lib/utils/rpgf/types/application';
  import type { ComponentProps } from 'svelte';
  import z from 'zod';

  interface Props {
    field: ApplicationUrlField;
    answer?: ApplicationUrlAnswerDto | undefined;
    valid?: boolean;
    forceRevealError?: boolean | undefined;
  }

  let {
    field,
    answer = $bindable(undefined),
    valid = $bindable(false),
    forceRevealError = undefined
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

  function isValidUrl(url: string): boolean {
    // ensure valid URL, explicitly no spaces allowed
    return z
      .string()
      .url()
      .refine((val) => !/\s/.test(val))
      .safeParse(url).success;
  }

  let hasValidUrl = $derived(value !== undefined && value.trim() !== '' && isValidUrl(value));
  run(() => {
    if (field.required) {
      valid = hasValidUrl;
    } else if (value !== undefined && value.trim() !== '' && !isValidUrl(value)) {
      valid = false;
    } else {
      valid = true;
    }
  });

  let beenFocussed = $state(false);
  let formFieldValidationState: ComponentProps<typeof FormField>['validationState'] = $derived(valid
    ? { type: 'valid' }
    : beenFocussed || forceRevealError
      ? {
          type: 'invalid',
          message:
            'This field is required and must be a full, valid URL without spaces, including https://.',
        }
      : { type: 'valid' });
  
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

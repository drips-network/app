<script lang="ts">
  import { run } from 'svelte/legacy';

  import { goto, invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { createApplicationForm } from '$lib/utils/rpgf/rpgf';
  import type { ApplicationForm } from '$lib/utils/rpgf/types/application';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    roundId: string;
    form: ApplicationForm;
  }

  let { roundId, form }: Props = $props();

  let nameValue = $state('');

  let nameValidationState = $state<TextInputValidationState>({ type: 'unvalidated' });
  run(() => {
    if (nameValue.length === 0) {
      nameValidationState = { type: 'unvalidated' };
    } else if (nameValue.length > 255) {
      nameValidationState = { type: 'invalid', message: 'Name must be at most 255 characters' };
    } else {
      nameValidationState = { type: 'valid' };
    }
  });

  function handleCreate() {
    dispatch('await', {
      message: 'Creating form…',
      promise: async () => {
        const createdForm = await createApplicationForm(undefined, roundId, {
          name: nameValue,
          fields: form.fields,
        });

        await invalidate('rpgf:round');
        dispatch('conclude');
        await goto(`/app/rpgf/rounds/${roundId}/settings/application/forms/${createdForm.id}`);
      },
    });
  }
</script>

<StandaloneFlowStepLayout headline="Copy {form.name}">
  <FormField
    title="New form name*"
    description="Enter a unique name for the new form. This is only visible to admins."
  >
    <TextInput placeholder="Default form" bind:value={nameValue} />
  </FormField>

  <AnnotationBox type="info"
    >Your form will be created with the same fields as {form.name}, and you can edit its fields
    later.</AnnotationBox
  >

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={nameValidationState.type !== 'valid'}
      type="submit"
      icon={CheckCircle}
      onclick={handleCreate}>Copy form</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>

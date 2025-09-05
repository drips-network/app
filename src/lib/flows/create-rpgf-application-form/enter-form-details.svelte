<script lang="ts">
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
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let roundId: string;

  let nameValue = '';

  let nameValidationState: TextInputValidationState;
  $: {
    if (nameValue.length === 0) {
      nameValidationState = { type: 'unvalidated' };
    } else if (nameValue.length > 255) {
      nameValidationState = { type: 'invalid', message: 'Name must be at most 255 characters' };
    } else {
      nameValidationState = { type: 'valid' };
    }
  }

  function handleCreate() {
    dispatch('await', {
      message: 'Creating form…',
      promise: async () => {
        const createdForm = await createApplicationForm(undefined, roundId, {
          name: nameValue,
          fields: [],
        });

        await invalidate('rpgf:round');
        dispatch('conclude');
        await goto(`/app/rpgf/rounds/${roundId}/settings/application/forms/${createdForm.id}`);
      },
    });
  }
</script>

<StandaloneFlowStepLayout headline="Create form">
  <FormField
    title="Form name*"
    description="Enter a unique name for this form. This is only visible to admins."
  >
    <TextInput placeholder="Default form" bind:value={nameValue} />
  </FormField>

  <AnnotationBox type="info">You can add fields to the form after creating it.</AnnotationBox>

  <svelte:fragment slot="actions">
    <Button
      variant="primary"
      disabled={nameValidationState.type !== 'valid'}
      type="submit"
      icon={CheckCircle}
      on:click={handleCreate}>Create form</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

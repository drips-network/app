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
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    roundId: string;
  }

  let { roundId }: Props = $props();

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
          fields: [],
        });

        await invalidate('rpgf:round:applications:categories-and-forms');
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

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={nameValidationState.type !== 'valid'}
      type="submit"
      icon={CheckCircle}
      onclick={handleCreate}>Create form</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>

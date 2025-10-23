<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { createCustomDataset } from '$lib/utils/rpgf/rpgf';
  import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let roundId: string;
  export let existingCustomDatasets: CustomDataset[];

  let nameValue = '';

  let nameValidationState: TextInputValidationState;
  $: {
    if (nameValue.length === 0) {
      nameValidationState = { type: 'unvalidated' };
    } else if (nameValue.length > 255) {
      nameValidationState = { type: 'invalid', message: 'Name must be at most 255 characters' };
    } else if (
      existingCustomDatasets.some((cds) => cds.name.toLowerCase() === nameValue.toLowerCase())
    ) {
      nameValidationState = {
        type: 'invalid',
        message: 'A dataset with this name already exists',
      };
    } else {
      nameValidationState = { type: 'valid' };
    }
  }

  function handleCreate() {
    dispatch('await', {
      message: 'Creating dataset…',
      promise: async () => {
        await createCustomDataset(undefined, roundId, nameValue);

        await invalidate('rpgf:round:applications:custom-datasets');

        dispatch('conclude');
      },
    });
  }
</script>

<StandaloneFlowStepLayout headline="Create custom dataset">
  <FormField title="Name*">
    <TextInput
      validationState={nameValidationState}
      placeholder="Code Metrics"
      bind:value={nameValue}
    />
  </FormField>

  <AnnotationBox type="info">
    You'll be able to upload the CSV for the dataset after creating it.
  </AnnotationBox>

  <svelte:fragment slot="actions">
    <Button
      variant="primary"
      disabled={nameValidationState.type !== 'valid'}
      type="submit"
      icon={CheckCircle}
      on:click={handleCreate}>Create custom dataset</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

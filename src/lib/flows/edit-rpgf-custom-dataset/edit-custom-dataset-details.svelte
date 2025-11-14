<script lang="ts">
  import { run } from 'svelte/legacy';

  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import { updateCustomDataset } from '$lib/utils/rpgf/rpgf';
  import type { CustomDataset } from '$lib/utils/rpgf/types/customDataset';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    customDataset: CustomDataset;
    existingCustomDatasets: CustomDataset[];
  }

  let { customDataset, existingCustomDatasets }: Props = $props();

  let nameValue = $state(customDataset.name);

  let nameValidationState: TextInputValidationState = $state();
  run(() => {
    if (nameValue.length === 0) {
      nameValidationState = { type: 'unvalidated' };
    } else if (nameValue.length > 255) {
      nameValidationState = { type: 'invalid', message: 'Name must be at most 255 characters' };
    } else if (
      existingCustomDatasets
        .filter((cds) => cds.id !== customDataset.id)
        .some((cds) => cds.name.toLowerCase() === nameValue.toLowerCase())
    ) {
      nameValidationState = {
        type: 'invalid',
        message: 'A dataset with this name already exists',
      };
    } else {
      nameValidationState = { type: 'valid' };
    }
  });

  let visible: boolean = $state(customDataset.isPublic);

  function handleCreate() {
    dispatch('await', {
      message: 'Updating dataset…',
      promise: async () => {
        await updateCustomDataset(
          undefined,
          customDataset.roundId,
          customDataset.id,
          nameValue,
          visible,
        );

        await invalidate('rpgf:round:applications:custom-datasets');

        dispatch('conclude');
      },
    });
  }
</script>

<StandaloneFlowStepLayout headline="Edit custom dataset">
  <FormField title="Name*">
    <TextInput
      validationState={nameValidationState}
      placeholder="Code Metrics"
      bind:value={nameValue}
    />
  </FormField>

  <FormField
    title="Visibility"
    description="When set to visible, the dataset is immediately shown on matching application views and included with CSV exports."
  >
    <Toggle bind:checked={visible} label="Visible publicly" />
  </FormField>

  <AnnotationBox type="info">
    To edit the dataset contents, click the CSV upload button.
  </AnnotationBox>

  {#snippet actions()}
  
      <Button
        variant="primary"
        disabled={nameValidationState.type !== 'valid'}
        type="submit"
        icon={CheckCircle}
        onclick={handleCreate}>Update custom dataset</Button
      >
    
  {/snippet}
</StandaloneFlowStepLayout>

<script lang="ts">
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './link-kyc-request-to-application-flow';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import { linkExistingKycRequestToApplication } from '$lib/utils/rpgf/rpgf';
  import Button from '$lib/components/button/button.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;
  export let applicationId: string;

  let kycIdValue: string[] = [];

  function handleLink() {
    dispatch('await', {
      message: 'Linking KYC to application...',
      promise: async () => {
        const kycId = kycIdValue[0];

        // Link the KYC to the application
        await linkExistingKycRequestToApplication(undefined, applicationId, kycId);
      },
    });
  }
</script>

<StandaloneFlowStepLayout
  headline="Link an existing KYC"
  description="If you're submitting multiple applications as the same individual or business, you can link an existing KYC process to this application instead of starting a new one."
>
  {#if $context.kycRequests.length === 0}
    <AnnotationBox type="info"
      >You don't have any existing KYC processes to link. You can go back and start a new KYC
      process instead.</AnnotationBox
    >
  {/if}

  <FormField
    title="Select an existing KYC process*"
    description="Select one of your existing KYC processes for this round by its email address."
    disabled={$context.kycRequests.length === 0}
  >
    <div class="list-wrapper">
      <ListSelect
        items={Object.fromEntries(
          $context.kycRequests.map((kr) => [
            kr.id,
            {
              type: 'selectable',
              label: kr.kycEmail,
              text: `${kr.kycType} - ${kr.status}`,
            },
          ]),
        )}
        bind:selected={kycIdValue}
      />
    </div>
  </FormField>

  <AnnotationBox>This action cannot be undone.</AnnotationBox>

  <svelte:fragment slot="actions">
    <Button
      on:click={handleLink}
      disabled={kycIdValue.length === 0}
      variant="primary"
      icon={CheckCircle}>Confirm</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .list-wrapper {
    min-height: 14rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
  }
</style>

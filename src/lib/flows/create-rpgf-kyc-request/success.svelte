<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './create-rpgf-kyc-request-flow';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<State>;
  }

  let { context }: Props = $props();
</script>

<StandaloneFlowStepLayout
  headline="KYC started"
  description="You have successfully started the KYC process. Please complete the verification form linked below to proceed."
>
  <AnnotationBox type="info">
    You can track the progress of your KYC verification on your application page, and also find the
    verification link there if you need it later.
  </AnnotationBox>

  <Button
    size="large"
    variant="primary"
    icon={ArrowBoxUpRight}
    href={$context.kycFormUrl ?? undefined}
    target="_blank"
    rel="noopener noreferrer"
  >
    Open KYC provider form
  </Button>

  {#snippet actions()}
  
      <Button onclick={() => dispatch('conclude')}>Close</Button>
    
  {/snippet}
</StandaloneFlowStepLayout>

<script lang="ts">
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';
  import StandaloneFlowHeaderEmoji from '../components/standalone-flow-header-icon/standalone-flow-header-emoji.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import funderOnboardingSteps from './steps/funder-onboarding-steps';
</script>

<StandaloneFlowStepHeader
  component={{
    component: StandaloneFlowHeaderEmoji,
    props: {
      emoji: '🫧',
    },
  }}
/>

<Stepper steps={funderOnboardingSteps()} minHeightPx={512} />

<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';
</script>

<div>
  <PrimaryColorThemer colorHex={undefined}>
    <StandaloneFlowStepHeader title="Claim project" />
  </PrimaryColorThemer>
</div>

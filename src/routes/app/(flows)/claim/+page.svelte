<script lang="ts">
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import StandaloneFlowHeaderEmoji from '../components/standalone-flow-header-icon/standalone-flow-header-emoji.svelte';
  import StandaloneFlowStepHeader from '../components/standalone-flow-step-header/standalone-flow-step-header.svelte';

  let component = {
    component: StandaloneFlowHeaderEmoji,
    props: {
      emoji: '👛',
    },
  };
</script>

<div>
  <PrimaryColorThemer colorHex={undefined}>
    <StandaloneFlowStepHeader {component} />
  </PrimaryColorThemer>
</div>

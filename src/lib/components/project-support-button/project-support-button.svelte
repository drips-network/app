<script lang="ts">
  import {
    SupportButtonStyle,
    type SupportButtonContext,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import DripsSupportButton from './drips-style-button.svelte';
  import GithubSupportButton from './github-style-button.svelte';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { setContext, onMount, createEventDispatcher } from 'svelte';

  export let data: SupportButtonData;
  export let options: SupportButtonOptions;

  const dispatch = createEventDispatcher<{ load: void }>();

  function emitLoad() {
    dispatch('load');
  }

  setContext<SupportButtonContext>('supportButton', { emitLoad });

  onMount(() => {
    fiatEstimates.start();
  });
</script>

{#if options.style === SupportButtonStyle.github}
  <GithubSupportButton {data} {options} />
{:else}
  <DripsSupportButton {data} {options} />
{/if}

<style>
</style>

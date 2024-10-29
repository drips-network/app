<script lang="ts">
  import {
    SupportButtonStyle,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import DripsSupportButton from './drips-style-button.svelte';
  import GithubSupportButton from './github-style-button.svelte';
  import fiatEstimates from '$lib/utils/fiat-estimates/fiat-estimates';
  import { onMount } from 'svelte';

  export let data: SupportButtonData;
  export let options: SupportButtonOptions;

  onMount(() => {
    // TODO:
    // - ensure that we have the prices first if we are rendering a button with a money amount
    // - the button components could be DRY-er
    fiatEstimates.start();
  });
</script>

{#if options.style === SupportButtonStyle.github}
  <GithubSupportButton {data} {options} on:load />
{:else}
  <DripsSupportButton {data} {options} on:load />
{/if}

<style>
</style>

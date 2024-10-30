<script lang="ts">
  import {
    SupportButtonStyle,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import DripsSupportButton from './drips-style-button.svelte';
  import GithubSupportButton from './github-style-button.svelte';

  export let data: SupportButtonData;
  export let options: SupportButtonOptions;
</script>

{#if options.style === SupportButtonStyle.github}
  <GithubSupportButton {data} {options} />
{:else}
  <DripsSupportButton {data} {options} />
{/if}

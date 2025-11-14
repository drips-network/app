<script lang="ts">
  import {
    SupportButtonStyle,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import DripsSupportButton from './drips-style-button.svelte';
  import GithubSupportButton from './github-style-button.svelte';

  interface Props {
    data: SupportButtonData;
    options: SupportButtonOptions;
  }

  let { data, options }: Props = $props();
</script>

{#if options.style === SupportButtonStyle.github}
  <GithubSupportButton {data} {options} />
{:else}
  <DripsSupportButton {data} {options} />
{/if}

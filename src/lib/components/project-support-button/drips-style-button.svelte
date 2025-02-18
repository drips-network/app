<script lang="ts">
  import Drip from '$lib/components/illustrations/drip.svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import {
    getDependenciesStatement,
    getDripFill,
    SupportButtonStat,
    SupportButtonText,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';

  export let options: SupportButtonOptions;
  export let data: SupportButtonData;

  $: dripFill = getDripFill(options);
  $: dependenciesStatement = getDependenciesStatement(data?.dependencies);
</script>

<a
  href={data.projectUrl}
  class={`support-button support-button--drips support-button--${options.background} support-button--${options.text} support-button--${options.stat}`}
>
  <span class="support-button__icon">
    <Drip fill={dripFill} />
  </span>

  <span class="support-button__text">
    {#if options.text === SupportButtonText.me}
      Support me
    {:else if options.text === SupportButtonText.us}
      Support us
    {:else if options.text === SupportButtonText.project}
      Support <span class="support-button__text__avatar"
        ><ProjectAvatar project={data.projectData} size="tiny" /></span
      ><strong>{data.projectName}</strong>
    {/if}
  </span>

  {#if options.stat === SupportButtonStat.support}
    <span class="support-button__support"
      ><AggregateFiatEstimate
        amounts={data.projectData.totalEarned}
        prices={data.prices}
        supressUnknownAmountsWarning={true}
      /></span
    >
  {:else if options.stat === SupportButtonStat.dependencies}
    <span class="support-button__dependencies">{dependenciesStatement}</span>
  {/if}
</a>

<style>
  .support-button--drips {
    border: 1px solid #28333d;
    padding: 0 10px;
    border-radius: 1rem 0 1rem 1rem;
    display: inline-flex;
    gap: 7px;
    align-items: center;
    height: 32px;
    background-color: #ffffff;
    color: #28333d;
    white-space: nowrap;
    font-family: var(--typeface-regular);
  }

  .support-button--drips.support-button--dark {
    background-color: #28333d;
    color: #ffffff;
  }

  .support-button--drips.support-button--blue {
    background-color: #5555ff;
    color: #ffffff;
  }

  .support-button__icon {
    width: 12px;
    display: flex;
    align-items: center;
  }

  .support-button__text {
    display: flex;
    gap: 7px;
    align-items: center;
  }

  .support-button__avatar {
    width: 24px;
    height: 24px;
    border-radius: 100%;
  }

  .support-button__dependencies,
  .support-button__support {
    color: #ffffff;
    font-weight: 600;
  }

  .support-button--drips.support-button--light .support-button__dependencies,
  .support-button--drips.support-button--light .support-button__support {
    color: #5555ff;
  }

  .support-button strong {
    font-weight: 600;
  }

  .support-button__text__avatar {
    margin-right: -3.5px;
  }
</style>

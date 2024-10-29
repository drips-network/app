<script lang="ts">
  import Drip from '$lib/components/illustrations/drip.svelte';
  import {
    SupportButtonBackground,
    SupportButtonStat,
    SupportButtonText,
    type SupportButtonData,
    type SupportButtonOptions,
  } from './project-support-button';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher<{ load: void }>();

  export let options: SupportButtonOptions;
  export let data: SupportButtonData;

  $: dripFill = options.background === SupportButtonBackground.blue ? 'white' : '#5555ff';
  $: dripStroke = options.background === SupportButtonBackground.blue ? '#5555ff' : 'white';
  $: dependencies = data?.dependencies || 0;
  $: dependenciesString =
    dependencies && dependencies === 1
      ? `Splitting to ${dependencies} Dependency`
      : `Splitting to ${dependencies} Dependencies`;

  function emitLoad() {
    dispatch('load');
  }

  onMount(() => {
    if (options.stat !== SupportButtonStat.support) {
      emitLoad();
    }
  });
</script>

<a
  href={data.projectUrl}
  class={`support-button support-button--github support-button--${options.background} support-button--${options.text} support-button--${options.stat}`}
>
  <span class="support-button__icon">
    <Drip fill={dripFill} stroke={dripStroke} strokeWidth="4px" />
  </span>

  <span class="support-button__text">
    {#if options.text === SupportButtonText.me}
      Drip to me
    {:else if options.text === SupportButtonText.us}
      Support us on Drips
    {:else if options.text === SupportButtonText.project}
      Support <ProjectAvatar project={data.projectAvatar} size="micro" /><strong
        >{data.projectName}</strong
      > on Drips
    {/if}
  </span>

  {#if options.stat === SupportButtonStat.support}
    <span class="support-button__support"
      ><AggregateFiatEstimate
        on:loaded={emitLoad}
        amounts={data.projectAvatar.totalEarned}
        supressUnknownAmountsWarning={true}
      /></span
    >
  {:else if options.stat === SupportButtonStat.dependencies}
    <span class="support-button__dependencies">{dependenciesString}</span>
  {/if}
</a>

<style>
  .support-button strong {
    font-weight: 600;
  }

  .support-button--github {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-family: Verdana, sans-serif;
    gap: 3px;
    background: linear-gradient(0deg, #425160 0%, #5a6b7c 100%);
    height: 20px;
    padding: 0 4px;
    color: white;
    border-radius: 4px;
    overflow: hidden;
  }

  .support-button__icon {
    width: 6px;
    display: flex;
    align-items: center;
  }

  .support-button__text {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .support-button--github.support-button--dependencies,
  .support-button--github.support-button--support {
    padding-right: 0;
  }

  .support-button__support,
  .support-button__dependencies {
    background: #5555ff;
    height: 20px;
    padding: 0 4px;
    display: flex;
    align-items: center;
  }
</style>

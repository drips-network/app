<script lang="ts">
  import Drip from '$lib/components/illustrations/drip.svelte';
  import { BadgeStat, BadgeText, type BadgeData, type BadgeOptions } from './badge';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';

  export let options: BadgeOptions;
  export let data: BadgeData;

  $: dripFill = options.background === 'blue' ? 'var(--color-background)' : 'var(--color-primary)';
  $: dripStroke = options.background === 'blue' ? 'var(--color-primary)' : 'white';
  $: dependencies = data?.dependencies || 0;
  $: dependenciesString =
    dependencies && dependencies === 1
      ? `Splitting to ${dependencies} Dependency`
      : `Splitting to ${dependencies} Dependencies`;
</script>

<div
  class={`embed-badge embed-badge--github embed-badge--${options.background} embed-badge--${options.text} embed-badge--${options.stat}`}
>
  <span class="embed-badge__icon">
    <Drip fill={dripFill} stroke={dripStroke} strokeWidth="4px" />
  </span>

  <span class="embed-badge__text">
    {#if options.text === BadgeText.me}
      Drip to me
    {:else if options.text === BadgeText.us}
      Support us on Drips
    {:else if options.text === BadgeText.project}
      Support <ProjectAvatar project={data.projectAvatar} size="micro" /><strong
        >{data.projectName}</strong
      > on Drips
    {/if}
  </span>

  {#if options.stat === BadgeStat.support}
    <span class="embed-badge__support">{data.support}</span>
  {:else if options.stat === BadgeStat.dependencies}
    <span class="embed-badge__dependencies">{dependenciesString}</span>
  {/if}
</div>

<style>
  .embed-badge strong {
    font-weight: 600;
  }

  .embed-badge--github {
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

  .embed-badge__icon {
    width: 6px;
    display: flex;
    align-items: center;
  }

  .embed-badge__text {
    display: flex;
    gap: 3px;
    align-items: center;
  }

  .embed-badge--github.embed-badge--dependencies,
  .embed-badge--github.embed-badge--support {
    padding-right: 0;
  }

  .embed-badge__support,
  .embed-badge__dependencies {
    background: var(--color-primary);
    height: 20px;
    padding: 0 4px;
    display: flex;
    align-items: center;
  }
</style>

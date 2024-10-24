<script lang="ts">
  import Drip from "$lib/components/illustrations/drip.svelte";
  import { BadgeStat, BadgeText, type BadgeData, type BadgeOptions } from "./badge";

  export let options: BadgeOptions;
  export let data: BadgeData;

  $: dripFill = options.background === 'blue' ? 'var(--color-background)' : 'var(--color-primary)'
  $: dependencies = data?.dependencies || 0
  $: dependenciesString = dependencies && dependencies === 1 ?
    `Splitting to ${dependencies} Dependency` :
    `Splitting to ${dependencies} Dependencies`
</script>

<div
  class={`embed-badge embed-badge--drips embed-badge--${options.background} embed-badge--${options.text} embed-badge--${options.stat}`}
  >
  <span class="embed-badge__icon">
    <Drip fill={dripFill}/>
  </span>

  <span class="embed-badge__text">
  {#if options.text === BadgeText.me}
    Drip to me
  {:else if options.text === BadgeText.us}
    Support on Drips
  {:else if options.text === BadgeText.project}
    Support on <img src={data.projectImageUrl} alt="{data.projectName} avatar"/><em>{data.projectName}</em> on Drips
  {/if}
  </span>

  {#if options.stat === BadgeStat.support}
    <span class="embed-badge__support">{data.support}</span>
  {:else if options.stat === BadgeStat.dependencies}
    <span class="embed-badge__dependencies">{dependenciesString}</span>
  {/if}
</div>

<style>
  .embed-badge--drips {
    border: 1px solid var(--color-foreground);
    padding: 0 10px;
    border-radius: 1rem 0 1rem 1rem;
    display: inline-flex;
    gap: 7px;
    align-items: center;
    height: 32px;
    background: var(--color-background);
  }

  .embed-badge__icon {
    width: 12px;
    display: flex;
    align-items: center;
  }

  .embed-badge--drips.embed-badge--dark {
    background: var(--color-foreground);
    color: var(--color-background);
  }

  .embed-badge--drips.embed-badge--blue {
    background: var(--color-primary);
    color: var(--color-background);
  }
</style>
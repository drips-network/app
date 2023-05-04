<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import { getSplitPercent } from '$lib/utils/get-split-percent';
  import { fade } from 'svelte/transition';
  import SplitsListComponent, { type Splits } from '../../splits.svelte';
  import type { Split, SplitGroup } from '../../splits.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import { tick, type SvelteComponent, onMount } from 'svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import { tweened } from 'svelte/motion';
  import { sineInOut } from 'svelte/easing';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  export let split: Split | SplitGroup;

  let element: HTMLDivElement;

  let groupExpanded = false;

  $: primaryColor = element
    ? getComputedStyle(element).getPropertyValue('--color-primary')
    : undefined;

  $: percentageTextColor = primaryColor ? getContrastColor(primaryColor) : 'white';

  function calcGroupWeight(group: SplitGroup): number {
    return group.list.reduce(
      (acc, split) =>
        split.type === 'split-group' ? acc + calcGroupWeight(split) : acc + split.weight,
      0,
    );
  }

  function flattenList(list: Splits): Split[] {
    return list.reduce<Split[]>((acc, i) => {
      if (i.type === 'split-group') {
        return [...acc, ...flattenList(i.list)];
      }
      return [...acc, i];
    }, []);
  }

  interface ComponentAndProps {
    component: typeof SvelteComponent;
    props: Record<string, unknown>;
  }

  function getPileComponents(list: Splits): ComponentAndProps[] {
    const containedSplits = flattenList(list);

    return mapFilterUndefined(containedSplits, (s) => {
      if (s.type === 'drips-donation-split') return;

      if (s.type === 'address-split') {
        return {
          component: IdentityBadge,
          props: {
            showIdentity: false,
            address: s.address,
            size: 'medium',
            outline: true,
          },
        } as ComponentAndProps;
      } else {
        return {
          component: ProjectAvatar,
          props: {
            project: s.project,
            outline: true,
          },
        } as ComponentAndProps;
      }
    });
  }

  const GROUP_EXPAND_DURATION = 300;
  let groupElem: HTMLDivElement | undefined;
  let groupHeight = tweened(48, { duration: GROUP_EXPAND_DURATION, easing: sineInOut });
  let groupHeightAnimating = false;

  let groupPileElem: HTMLDivElement | undefined;
  let groupNameOffset = tweened(0, { duration: GROUP_EXPAND_DURATION, easing: sineInOut });

  onMount(() => {
    groupNameOffset.set((groupPileElem?.offsetWidth ?? 0) + 8, { duration: 0 });
  });

  async function toggleGroup() {
    if (!groupElem) return;

    groupExpanded = !groupExpanded;

    await tick();

    groupHeightAnimating = true;
    setTimeout(() => (groupHeightAnimating = false), GROUP_EXPAND_DURATION);

    groupNameOffset.set(groupExpanded ? 0 : (groupPileElem?.offsetWidth ?? 0) + 8);

    if (groupExpanded) {
      groupHeight.set(groupElem.scrollHeight);
    } else {
      groupHeight.set(groupElem.scrollHeight, { duration: 0 });
      groupHeight.set(48);
    }
  }
</script>

<div class="wrapper">
  <div class="split" bind:this={element}>
    <div class="arrow">
      <svg
        width="103"
        height="49"
        viewBox="0 0 103 49"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1C1 1 1 25 25 25C55.0704 25 102 25 102 25M102 25L95.5 18.5M102 25L95.5 31.5"
          stroke="var(--color-foreground)"
          stroke-linecap="round"
        />
      </svg>
      <div class="percentage typo-text-small" style:color={percentageTextColor}>
        {getSplitPercent(
          split.type === 'split-group' ? calcGroupWeight(split) : split.weight,
          'pretty',
        )}
      </div>
    </div>
    <div class="receiver">
      {#if split.type === 'address-split'}
        <IdentityBadge address={split.address} size="medium" />
      {:else if split.type === 'drips-donation-split'}
        <div class="drips-logo">
          <DripsLogo />
        </div>
      {:else if split.type === 'project-split'}
        <PrimaryColorThemer colorHex={split.project.claimed ? split.project.color : undefined}>
          <ProjectBadge project={split.project} />
        </PrimaryColorThemer>
      {:else if split.type === 'split-group'}
        <div
          class="group"
          bind:this={groupElem}
          style:height={groupHeightAnimating ? `${$groupHeight}px` : 'auto'}
        >
          <button class="name" on:click={toggleGroup}>
            <div class="pile" bind:this={groupPileElem}>
              <Pile transitionedOut={groupExpanded} components={getPileComponents(split.list)} />
            </div>
            <div class="label" style:transform="translateX({$groupNameOffset}px)">
              <h4>{split.name}</h4>
              <div
                class="chevron"
                style:transform={groupExpanded ? 'rotate3d(1, 0, 0, 180deg)' : ''}
              >
                <ChevronDown />
              </div>
            </div>
          </button>
          {#if groupExpanded}
            <div transition:fade={{ duration: GROUP_EXPAND_DURATION }} class="members">
              <SplitsListComponent isGroup list={split.list} />
            </div>
          {/if}
          <div class="cutoff-gradient" />
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
  }

  .split {
    display: flex;
    gap: 1rem;
  }

  .arrow {
    position: relative;
  }

  .arrow .percentage {
    position: absolute;
    top: 0.85rem;
    left: calc(0.25rem + 50%);
    transform: translateX(-50%);
    height: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    padding: 0.125rem 0.5rem;
    border-radius: 0.75rem 0 0.75rem 0.75rem;
    background-color: var(--color-primary);
  }

  .receiver {
    display: flex;
    width: 100%;
    align-items: center;
  }

  .group {
    overflow: hidden;
    width: 100%;
  }

  .group .cutoff-gradient {
    height: 1rem;
    width: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, var(--color-background) 100%);
    position: absolute;
    bottom: -0.5rem;
  }

  .group .members {
    margin-top: -0.5rem;
  }

  .name {
    height: 49px;
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
  }

  .name .label {
    position: absolute;
    left: 0;
    display: flex;
    gap: 0.25rem;
  }

  .name .chevron {
    transition: transform 0.4s;
  }

  .drips-logo {
    height: 1.25rem;
  }
</style>

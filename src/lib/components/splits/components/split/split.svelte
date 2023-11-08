<script lang="ts">
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import PrimaryColorThemer from '$lib/components/primary-color-themer/primary-color-themer.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import { getSplitPercent } from '$lib/utils/splits/get-split-percent';
  import { fade } from 'svelte/transition';
  import SplitsListComponent, { type Splits } from '../../splits.svelte';
  import type { SplitsComponentSplitsReceiver, SplitGroup } from '../../splits.svelte';
  import Pile from '$lib/components/pile/pile.svelte';
  import { tick, type SvelteComponent, onMount } from 'svelte';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import { tweened } from 'svelte/motion';
  import { sineInOut } from 'svelte/easing';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import DripListBadge from '$lib/components/drip-list-badge/drip-list-badge.svelte';
  import ChevronRight from 'radicle-design-system/icons/ChevronRight.svelte';
  import isClaimed from '$lib/utils/project/is-claimed';

  export let split: SplitsComponentSplitsReceiver | SplitGroup;
  export let linkToNewTab = false;
  export let isNested = false;

  /** Set to false to hide the chevron next to split groups. */
  export let groupsExpandable = true;

  /** Set to true if it's the last split in a list. Disables the lefthand line down to the next split. */
  export let isLast = false;
  /** Set to true if it's the first split in a list. Enables the little gradient line at the top from the source. */
  export let isFirst = false;

  let element: HTMLDivElement;

  let groupExpanded = false;

  $: primaryColor = element
    ? getComputedStyle(element).getPropertyValue('--color-primary')
    : undefined;

  $: percentageTextColor = primaryColor ? getContrastColor(primaryColor) : 'white';

  function calcGroupWeight(group: SplitGroup): number {
    return group.list.reduce(
      (acc, split) =>
        split.__typename === 'SplitGroup' ? acc + calcGroupWeight(split) : acc + split.weight,
      0,
    );
  }

  function flattenList(list: Splits): SplitsComponentSplitsReceiver[] {
    return list.reduce<SplitsComponentSplitsReceiver[]>((acc, i) => {
      if (i.__typename === 'SplitGroup') {
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
      switch (s.__typename) {
        case 'AddressReceiver':
          return {
            component: IdentityBadge,
            props: {
              showIdentity: false,
              address: s.account.address,
              size: 'medium',
              outline: true,
              disableLink: true,
            },
          } as ComponentAndProps;
        case 'DripListReceiver':
          return {
            component: DripListBadge,
            props: {
              dripList: s.dripList,
              showOwner: false,
              showName: false,
            },
          } as ComponentAndProps;
        case 'ProjectReceiver':
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
    if (split.__typename !== 'SplitGroup' || split.list.length === 0) return;

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
      <div
        class="percentage typo-text-small"
        class:is-nested={isNested}
        style:color={isNested ? 'var(--color-foreground)' : percentageTextColor}
      >
        {getSplitPercent(
          split.__typename === 'SplitGroup' ? calcGroupWeight(split) : split.weight,
          'pretty',
        )}
      </div>
      {#if isFirst}
        <div class="intro-line" />
      {/if}
      {#if !isLast}
        <div class="line" />
      {/if}
    </div>
    <div class="receiver">
      {#if split.__typename === 'AddressReceiver'}
        <IdentityBadge {linkToNewTab} address={split.account.address} size="medium" />
      {:else if split.__typename === 'DripListReceiver'}
        <DripListBadge dripList={split.dripList} />
      {:else if split.__typename === 'ProjectReceiver'}
        <PrimaryColorThemer colorHex={isClaimed(split.project) ? split.project.color : undefined}>
          <ProjectBadge {linkToNewTab} project={split.project} />
        </PrimaryColorThemer>
      {:else if split.__typename === 'SplitGroup'}
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
              <div class="typo-header-4">{split.name}</div>
              {#if split.list.length > 0 && groupsExpandable}
                <div
                  class="chevron"
                  style:transform={groupExpanded ? 'rotate3d(1, 0, 0, 90deg)' : ''}
                >
                  <ChevronRight />
                </div>
              {/if}
            </div>
            <div class="label placeholder" aria-hidden="true">
              <div class="typo-header-4">{split.name}</div>
            </div>
          </button>
          {#if groupExpanded}
            <div transition:fade|local={{ duration: GROUP_EXPAND_DURATION }} class="members">
              <SplitsListComponent {linkToNewTab} isGroup list={split.list} />
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

  .arrow .line {
    position: absolute;
    top: 0;
    left: 0.5px;
    width: 1px;
    height: calc(100% + 1px);
    background-color: var(--color-foreground);
  }

  .arrow .intro-line {
    position: absolute;
    top: -1rem;
    left: 0.5px;
    background: linear-gradient(to bottom, transparent, var(--color-foreground));
    height: calc(1rem + 1px);
    width: 1px;
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

  .arrow .percentage.is-nested {
    background: linear-gradient(45deg, var(--color-primary-level-2), var(--color-primary-level-2)),
      linear-gradient(45deg, var(--color-background), var(--color-background));
  }

  .receiver {
    display: flex;
    position: relative;
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

  .name .label.placeholder {
    position: relative;
    opacity: 0;
    pointer-events: none;
    margin-left: 8px;
    margin-right: 24px;
  }
</style>

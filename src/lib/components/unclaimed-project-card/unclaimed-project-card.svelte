<script lang="ts">
  import { fly } from 'svelte/transition';
  import ProjectBadge from '../project-badge/project-badge.svelte';
  import type { UnclaimedGitProject } from '$lib/utils/metadata/types';
  import Token from '../token/token.svelte';
  import KeyValuePair from '../key-value-pair/key-value-pair.svelte';
  import Pile from '../pile/pile.svelte';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Toggleable from '../toggleable/toggleable.svelte';
  import TokenAmountsTable from '../token-amounts-table/token-amounts-table.svelte';

  export let project: UnclaimedGitProject | undefined = undefined;
  export let projectMetadata:
    | {
        description?: string | undefined;
        starCount: number;
        forkCount: number;
      }
    | undefined = undefined;
  export let unclaimedFunds:
    | {
        tokenAddress: string;
        amount: bigint;
      }[]
    | undefined = undefined;

  $: unclaimedTokenPile = unclaimedFunds?.map((fund) => ({
    component: Token,
    props: {
      address: fund.tokenAddress,
      show: 'none',
    },
  }));

  let unclaimedTokensExpanded = false;
</script>

<div class="project-info" transition:fly={{ y: 8, duration: 300 }}>
  {#if project}
    <div class="basic-info">
      <ProjectBadge linkToNewTab {project} />
      {#if projectMetadata?.description}
        <p class="description typo-text">
          {projectMetadata.description}
        </p>
      {/if}
    </div>
  {/if}
  {#if unclaimedFunds}
    <div class="unclaimed-funds">
      <div class="row">
        {#if unclaimedTokenPile}
          <KeyValuePair key="Claimable tokens">
            <Pile maxItems={4} components={unclaimedTokenPile} />
            <button
              class="expand-chevron"
              on:click={() => (unclaimedTokensExpanded = !unclaimedTokensExpanded)}
              style:transform="rotate({unclaimedTokensExpanded ? 180 : 0}deg)"
            >
              <ChevronDown style="fill: var(--color-foreground); width: 2rem; height: 2rem;" />
            </button>
          </KeyValuePair>
        {/if}
        <KeyValuePair highlight key="Total est. claimable funds">
          <span style="color: var(--color-primary)"
            ><AggregateFiatEstimate amounts={unclaimedFunds} /></span
          >
        </KeyValuePair>
      </div>
      <Toggleable showToggle={false} toggled={unclaimedTokensExpanded}>
        <div class="token-amounts-table"><TokenAmountsTable amounts={unclaimedFunds} /></div>
      </Toggleable>
    </div>
  {/if}
</div>

<style>
  .project-info {
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    box-shadow: var(--elevation-low);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow: hidden;
  }

  .token-amounts-table {
    border-top: 1px solid var(--color-foreground);
  }

  .basic-info {
    padding: 1rem 1rem 0 1rem;
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .unclaimed-funds {
    padding-top: 1rem;
  }

  .unclaimed-funds .row {
    padding: 0 1rem 1rem 1rem;
    display: flex;
    gap: 3rem;
  }

  .expand-chevron {
    transition: transform 0.3s, background-color 0.3s;
    border-radius: 50%;
  }

  .expand-chevron:focus-visible {
    background-color: var(--color-primary-level-1);
  }
</style>

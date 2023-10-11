<script lang="ts">
  import { fly } from 'svelte/transition';
  import ProjectBadge from '../project-badge/project-badge.svelte';
  import Token from '../token/token.svelte';
  import KeyValuePair from '../key-value-pair/key-value-pair.svelte';
  import Pile from '../pile/pile.svelte';
  import ChevronDown from 'radicle-design-system/icons/ChevronDown.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Toggleable from '../toggleable/toggleable.svelte';
  import TokenAmountsTable from '../token-amounts-table/token-amounts-table.svelte';
  import Button from '../button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import type { UnclaimedGitProject } from '$lib/utils/project/types';

  const dispatch = createEventDispatcher();

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

  export let unclaimedTokensExpandable = true;
  export let unclaimedTokensExpanded = false;
  export let showClaimButton = false;
  export let claimableTokensKey = 'Tokens';
</script>

<div class="project-info" transition:fly|local={{ y: 8, duration: 300 }}>
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
      <div class="flex flex-col gap-6 p-4 sm:flex-row">
        <div class="flex flex-wrap items-start gap-6 sm:gap-12">
          {#if unclaimedTokenPile}
            <KeyValuePair key={claimableTokensKey}>
              {#if unclaimedFunds.length > 0}
                <Pile maxItems={4} components={unclaimedTokenPile} />
                {#if unclaimedTokensExpandable}
                  <button
                    class="expand-chevron"
                    on:click={() => (unclaimedTokensExpanded = !unclaimedTokensExpanded)}
                    style:transform="rotate({unclaimedTokensExpanded ? 180 : 0}deg)"
                  >
                    <ChevronDown
                      style="fill: var(--color-foreground); width: 2rem; height: 2rem;"
                    />
                  </button>
                {/if}
              {:else}
                <span class="muted">None</span>
              {/if}
            </KeyValuePair>
          {/if}
          <KeyValuePair highlight key="Estimated value">
            <span style="color: var(--color-primary)"
              ><AggregateFiatEstimate amounts={unclaimedFunds} /></span
            >
          </KeyValuePair>
        </div>

        {#if unclaimedFunds.length > 0 && showClaimButton}
          <div class="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end">
            <Button icon={Wallet} variant="normal" on:click={() => dispatch('claimButtonClick')}
              >Claim funds</Button
            >
          </div>
        {/if}
      </div>
      <Toggleable showToggle={false} toggled={unclaimedTokensExpanded}>
        <div class="token-amounts-table"><TokenAmountsTable amounts={unclaimedFunds} /></div>
      </Toggleable>
    </div>
  {/if}
</div>

<style>
  .project-info {
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground);
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

  .expand-chevron {
    transition: transform 0.3s, background-color 0.3s;
    border-radius: 50%;
  }

  .expand-chevron:focus-visible {
    background-color: var(--color-primary-level-1);
  }

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>

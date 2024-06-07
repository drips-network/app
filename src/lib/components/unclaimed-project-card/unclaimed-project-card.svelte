<script lang="ts" context="module">
  export const UNCLAIMED_PROJECT_CARD_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    ${MERGE_WITHDRAWABLE_BALANCES_FRAGMENT}
    fragment UnclaimedProjectCard on UnclaimedProject {
      ...ProjectBadge
      withdrawableBalances {
        ...MergeWithdrawableBalances
      }
    }
  `;
</script>

<script lang="ts">
  import { fly } from 'svelte/transition';
  import ProjectBadge, { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import Token from '../token/token.svelte';
  import KeyValuePair from '../key-value-pair/key-value-pair.svelte';
  import Pile from '../pile/pile.svelte';
  import ChevronDown from '$lib/components/icons/ChevronDown.svelte';
  import AggregateFiatEstimate from '../aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import Toggleable from '../toggleable/toggleable.svelte';
  import TokenAmountsTable from '../token-amounts-table/token-amounts-table.svelte';
  import Button from '../button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { gql } from 'graphql-request';
  import type { UnclaimedProjectCardFragment } from './__generated__/gql.generated';
  import {
    MERGE_WITHDRAWABLE_BALANCES_FRAGMENT,
    mergeCollectableFunds,
    mergeSplittableFunds,
  } from '$lib/utils/merge-withdrawable-balances';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';

  const dispatch = createEventDispatcher();

  export let project: UnclaimedProjectCardFragment;
  export let projectMetadata:
    | {
        description?: string | undefined;
        starCount: number;
        forkCount: number;
      }
    | undefined = undefined;

  $: collectableFunds = mergeCollectableFunds(project.withdrawableBalances);
  $: splittableFunds = mergeSplittableFunds(project.withdrawableBalances);

  $: mergedUnclaimedFunds = mergeAmounts(collectableFunds, splittableFunds);

  $: hasClaimableFunds = mergedUnclaimedFunds.length > 0;

  $: unclaimedTokenPile = mergedUnclaimedFunds?.map((fund) => ({
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

  /** Show which tokens are collectable / splittable */
  export let detailedTokenBreakdown = false;
</script>

<div class="project-info" transition:fly|local={{ y: 8, duration: 300 }}>
  {#if project}
    <div class="basic-info text-left">
      <ProjectBadge linkToNewTab {project} />
      {#if projectMetadata?.description}
        <p class="description typo-text">
          {projectMetadata.description}
        </p>
      {/if}
    </div>
  {/if}
  {#if hasClaimableFunds}
    <div class="unclaimed-funds">
      <div class="flex flex-col gap-6 p-4 sm:flex-row">
        <div class="flex flex-wrap items-start gap-6 sm:gap-12">
          {#if unclaimedTokenPile}
            <KeyValuePair key={claimableTokensKey}>
              {#if hasClaimableFunds}
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
          {#if hasClaimableFunds}
            <KeyValuePair highlight key="Estimated value">
              <span style="color: var(--color-primary)"
                ><AggregateFiatEstimate amounts={mergedUnclaimedFunds} /></span
              >
            </KeyValuePair>
          {/if}
        </div>

        {#if hasClaimableFunds && showClaimButton}
          <div class="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end">
            <Button icon={Wallet} variant="normal" on:click={() => dispatch('claimButtonClick')}
              >Claim funds</Button
            >
          </div>
        {/if}
      </div>
      <Toggleable showToggle={false} toggled={unclaimedTokensExpanded}>
        {#if detailedTokenBreakdown}
          <div class="tables-container">
            {#if collectableFunds.length > 0}
              <div class="table-and-title">
                <div class="title">
                  <h5>Collectable</h5>
                  <p class="typo-text-small">
                    These claimable funds will be collected directly to your connected wallet.
                  </p>
                </div>
                <div class="table">
                  <TokenAmountsTable amounts={collectableFunds} />
                </div>
              </div>
            {/if}
            {#if splittableFunds.length > 0}
              <div class="table-and-title">
                <div class="title">
                  <h5>Splittable</h5>
                  <p class="typo-text-small">
                    These claimable funds will be split with your maintainers and dependencies.
                  </p>
                </div>
                <div class="table">
                  <TokenAmountsTable amounts={splittableFunds} />
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="token-amounts-table">
            <TokenAmountsTable amounts={mergedUnclaimedFunds} />
          </div>
        {/if}
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

  .tables-container {
    border-top: 1px solid var(--color-foreground);
  }

  .tables-container .table-and-title {
    margin-top: 1rem;
  }

  .tables-container .table-and-title .title {
    padding: 0 1rem;
  }

  .tables-container .table-and-title .table {
    width: 100%;
  }

  .tables-container .table-and-title .title {
    color: var(--color-foreground-level-6);
  }
</style>

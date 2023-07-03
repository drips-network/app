<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import TokensIcon from 'radicle-design-system/icons/Orgs.svelte';
  import KeyValuePair from '$lib/components/key-value-pair/key-value-pair.svelte';
  import balancesStore from '$lib/stores/balances/balances.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import AggregateFiatEstimate from '$lib/components/aggregate-fiat-estimate/aggregate-fiat-estimate.svelte';
  import getCycle from '$lib/utils/drips/get-cycle';
  import { onMount } from 'svelte';
  import formatDate from '$lib/utils/format-date';
  import TokenAmountsTable from '$lib/components/token-amounts-table/token-amounts-table.svelte';
  import deduplicateReadable from '$lib/utils/deduplicate-readable';
  import { derived } from 'svelte/store';
  import TransitionedHeight from '$lib/components/transitioned-height/transitioned-height.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import SplittingGraph from '$lib/components/illustrations/splitting-graph.svelte';
  import ArrowBoxUpRight from 'radicle-design-system/icons/ArrowBoxUpRight.svelte';
  import CrossIcon from 'radicle-design-system/icons/Cross.svelte';
  import { fade } from 'svelte/transition';
  import ProjectsSection from '$lib/components/projects-section/projects-section.svelte';

  $: {
    $walletStore.connected;
    guardConnected();
  }

  $: userId = $walletStore.dripsUserId;

  const splittableStore = deduplicateReadable(
    derived([balancesStore], ([balances]) => {
      return userId ? balances.accounts[userId]?.splittable : undefined;
    }),
  );

  let cycle: Awaited<ReturnType<typeof getCycle>> | undefined;
  onMount(async () => {
    cycle = await getCycle();
  });

  $: tokensAvailableToCollect = $splittableStore && $splittableStore.length > 0;
</script>

<svelte:head>
  <title>Projects | Drips</title>
  <meta name="description" content="Drips Projects Page" />
</svelte:head>

<div class="page">
  <div class="section">
    {#if $walletStore.address}
      <ProjectsSection address={$walletStore.address} />
    {/if}
  </div>

  <div class="section">
    <SectionHeader icon={TokensIcon} label="Earnings" />
    <SectionSkeleton initHeight={106} loaded={Boolean(userId && $splittableStore && cycle)}>
      {#if userId && $splittableStore && cycle}
        <div class="earnings card">
          <div class="content">
            <div class="values">
              <KeyValuePair key="Collectable now" highlight>
                <AggregateFiatEstimate amounts={$splittableStore} />
              </KeyValuePair>
              <KeyValuePair key="Next payout">{formatDate(cycle.end, 'onlyDay')}</KeyValuePair>
            </div>
            <div />
          </div>
          {#if tokensAvailableToCollect}
            <div class="token-breakdown">
              <div class="token-amounts-table">
                <TokenAmountsTable showCollectButtons amounts={$splittableStore} />
              </div>
            </div>
          {/if}
        </div>
      {/if}
      <div class="edu-card-wrapper">
        <TransitionedHeight>
          {#if !$dismissablesStore.includes('splitting-graph-edu-card')}
            <div transition:fade|local={{ duration: 300 }} class="splitting-graph-edu card">
              <div class="illustration">
                <SplittingGraph />
              </div>
              <div class="content">
                <h2>How donations reach your projects</h2>
                <p>
                  Donations from funders are automatically trickled down a global dependency tree
                  every seven days.
                </p>
                <!-- TODO: Add link -->
                <div><Button icon={ArrowBoxUpRight}>Learn more</Button></div>
              </div>
              <button
                class="close-button"
                on:click={() => dismissablesStore.dismiss('splitting-graph-edu-card')}
              >
                <CrossIcon />
              </button>
            </div>
          {/if}
        </TransitionedHeight>
      </div>
    </SectionSkeleton>
  </div>
</div>

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .page {
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }

  .expand-chevron {
    transition: transform 0.3s, background-color 0.3s;
    border-radius: 50%;
  }

  .expand-chevron:focus-visible {
    background-color: var(--color-foreground-level-2);
  }

  .card {
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
    position: relative;
  }

  .earnings.card > .content {
    display: flex;
    gap: 4rem;
    padding: 1rem;
    justify-content: space-between;
    align-items: center;
  }

  .earnings.card > .content > .values {
    display: flex;
    gap: 4rem;
  }

  .earnings.card > .token-breakdown .token-amounts-table {
    padding: 0.5rem 0;
    border-top: 1px solid var(--color-foreground);
    background-color: var(--color-foreground-level-1);
  }

  button:disabled {
    opacity: 0.5;
  }

  .splitting-graph-edu.card {
    display: flex;
    gap: 2rem;
    padding-right: 2rem;
    align-items: center;
  }

  .splitting-graph-edu.card .content {
    display: flex;
    flex-direction: column;
    max-width: 40rem;
    gap: 1rem;
  }

  .splitting-graph-edu.card .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    transition: background-color 0.3s;
    border-radius: 1rem;
  }

  .splitting-graph-edu.card .close-button:focus-visible {
    background-color: var(--color-foreground-level-2);
  }

  .edu-card-wrapper {
    margin-top: 2rem;
  }
</style>

<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import buildUrl from '$lib/utils/build-url';
  import assert from '$lib/utils/assert';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import type { ClaimedProjectData } from '$lib/graphql/__generated__/base-types';

  export let context: Writable<State>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let loading = false;

  $: safeAppMode = Boolean($walletStore.safe);

  async function viewProject() {
    loading = true;

    const forge = $context.project?.source.forge;
    const username = $context.project?.source.ownerName;
    const repoName = $context.project?.source.repoName;
    const projectChainData = $context.project?.chainData
      ? (filterCurrentChainData($context.project.chainData) as ClaimedProjectData)
      : undefined;

    const collectedFunds =
      mergeAmounts(
        projectChainData?.withdrawableBalances.map((wb) => ({
          tokenAddress: wb.tokenAddress,
          amount: BigInt(wb.collectableAmount) + BigInt(wb.splittableAmount),
        })) ?? [],
      ).length > 0;

    const ownAccountId = $walletStore.dripsAccountId;
    assert(ownAccountId);

    await goto(
      buildUrl(
        `/app/projects/${forge?.toLowerCase()}/${username}/${repoName}?exact`,
        collectedFunds ? { collectHint: 'true' } : {},
      ),
    ).then(() => {
      loading = false;
      dispatch('conclude');
    });
  }
</script>

<div class="center-div">
  {#if loading}
    <Spinner />
  {:else if safeAppMode}
    <h4>Continue in your Safe</h4>
    <p>
      The project claim transaction has successfully been proposed to your Safe. Once it's executed,
      navigate to Projects on your Dashboard to view your newly-claimed project.
    </p>
    <a href="/app/projects">
      <Button variant="primary" icon={ArrowBoxUpRight}>View your projects</Button>
    </a>
  {:else}
    <h4>Congratulations!</h4>
    <p>Youʼve successfully claimed your project.</p>
    <Button variant="primary" icon={ArrowBoxUpRight} on:click={viewProject}
      >View project profile</Button
    >
  {/if}
</div>

<style>
  .center-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    min-height: 16rem;
    text-align: center;
  }
</style>

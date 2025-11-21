<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-orcid-flow';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import buildUrl from '$lib/utils/build-url';
  import assert from '$lib/utils/assert';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import buildOrcidUrl from '$lib/utils/orcids/build-orcid-url';
  import mergeAmounts from '$lib/utils/amounts/merge-amounts';

  export let context: Writable<State>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let loading = false;

  $: safeAppMode = Boolean($walletStore.safe);

  async function viewOrcid() {
    loading = true;

    const collectedFunds =
      mergeAmounts(
        $context.claimableAccount?.withdrawableBalances.map((wb) => ({
          tokenAddress: wb.tokenAddress,
          amount: BigInt(wb.collectableAmount) + BigInt(wb.splittableAmount),
        })) ?? [],
      ).length > 0;

    const ownAccountId = $walletStore.dripsAccountId;
    assert(ownAccountId);

    await goto(
      buildUrl(buildOrcidUrl($context.claimableId), collectedFunds ? { collectHint: 'true' } : {}),
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
      The ORCID claim transaction has successfully been proposed to your Safe. Once it's executed,
      navigate to ORCIDs on your Dashboard to view your newly-claimed ORCID.
    </p>
    <a href="/app/projects">
      <Button variant="primary" icon={ArrowBoxUpRight}>View your ORCIDs</Button>
    </a>
  {:else}
    <h4>Congratulations!</h4>
    <p>Youʼve successfully claimed your ORCID.</p>
    <Button variant="primary" icon={ArrowBoxUpRight} onclick={viewOrcid}>View ORCID profile</Button>
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

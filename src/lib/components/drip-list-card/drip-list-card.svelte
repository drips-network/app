<script lang="ts">
  import type { DripList } from '$lib/utils/metadata/types';
  import Pen from 'radicle-design-system/icons/Pen.svelte';
  import Button from '../button/button.svelte';
  import Drip from '../illustrations/drip.svelte';
  import Splits, { type Splits as RepresentationalSplits } from '../splits/splits.svelte';
  import streamsStore from '$lib/stores/streams/streams.store';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import KeyValuePair from '../key-value-pair/key-value-pair.svelte';
  import Token from '$lib/components/token/token.svelte';
  import Amount from '../amount/amount.svelte';
  import checkIsUser from '$lib/utils/check-is-user';
  import balancesStore from '$lib/stores/balances/balances.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { onMount } from 'svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { fade } from 'svelte/transition';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import editDripListSteps from '$lib/flows/edit-drip-list/edit-drip-list-steps';
  import editDripListStreamSteps from '$lib/flows/edit-drip-list-stream/edit-drip-list-stream-steps';
  import createDripListStreamSteps from '$lib/flows/create-drip-list-stream/create-drip-list-stream-steps';
  export let dripList: DripList;
  export let representationalSplits: RepresentationalSplits;

  // TODO: Truncate the representational splits into a splits group after 4 items.
  // TODO: Display the monthly stream amount on top of the list.
  // TODO: Add top up and withdraw buttons.

  $: ownerUserId = dripList.account.owner.userId;
  $: supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerUserId)
      .outgoing.filter((s) => s.receiver.userId === dripList.account.userId);

  $: supportStream = supportStreams[0];

  $: accountEstimate = $balancesStore.accounts[ownerUserId];
  $: outgoingEstimate = supportStream
    ? accountEstimate?.tokens[supportStream.dripsConfig.amountPerSecond.tokenAddress.toLowerCase()]
    : undefined;

  $: isOwnList = $walletStore && checkIsUser(dripList.account.owner.userId);

  let loadingSupportStream = true;
  onMount(async () => {
    if (!$streamsStore.accounts[ownerUserId]) {
      await streamsStore.fetchAccount(ownerUserId);
    }

    loadingSupportStream = false;
  });

  function triggerEditModal() {
    modal.show(
      Stepper,
      undefined,
      editDripListSteps(dripList.account.userId, representationalSplits),
    );
  }
</script>

<div class="card">
  <div class="header">
    <h1>{dripList.name}</h1>
    <div class="actions">
      {#if isOwnList}
        <Button on:click={triggerEditModal} icon={Pen}>Edit list</Button>
      {/if}
    </div>
  </div>
  <div class="list">
    <div class="drip-icon">
      <Drip />
    </div>
    <div class="splits-component"><Splits list={representationalSplits} /></div>
  </div>
  <div class="support-section">
    <div class="header">
      <h4>Continuous support</h4>
      {#if isOwnList}
        {#if supportStream}
          <Button
            icon={TokenStreams}
            on:click={() =>
              modal.show(Stepper, undefined, editDripListStreamSteps(dripList.account.userId))}
            >Edit stream</Button
          >
        {:else}
          <Button
            icon={TokenStreams}
            variant="primary"
            on:click={() =>
              modal.show(Stepper, undefined, createDripListStreamSteps(dripList.account.userId))}
            >Support your Drip List</Button
          >
        {/if}
      {/if}
    </div>
    {#if loadingSupportStream}
      <div class="loading">
        <Spinner />
      </div>
    {:else if supportStream}
      <div in:fade={{ duration: 300 }} class="support-stats">
        <KeyValuePair size="medium" key="Token">
          <Token size="small" address={supportStream.dripsConfig.amountPerSecond.tokenAddress} />
        </KeyValuePair>
        <KeyValuePair size="medium" key="Rate">
          <Amount amountPerSecond={supportStream.dripsConfig.amountPerSecond} />
        </KeyValuePair>
        <KeyValuePair size="medium" key="Balance">
          {#if outgoingEstimate}
            <Amount
              amount={{
                tokenAddress: supportStream.dripsConfig.amountPerSecond.tokenAddress,
                amount: outgoingEstimate.total.totals.remainingBalance,
              }}
            />
          {/if}
        </KeyValuePair>
      </div>
    {:else}
      This Drip List isn't receiving any continuous support.
    {/if}
  </div>
</div>

<style>
  .card {
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .card > .header {
    padding: 1.5rem 1.5rem 0 1.5rem;
    display: flex;
    justify-content: space-between;
  }

  .drip-icon {
    width: 1.5rem;
  }

  .list {
    padding: 0 1.5rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list:not(:last-child) {
    padding-bottom: 0;
  }

  .splits-component {
    margin-left: 10px;
  }

  .support-section {
    padding: 1.5rem;
    border-top: 1px solid var(--color-foreground);
  }

  .support-section > .header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .support-section > .support-stats {
    display: flex;
    gap: 4rem;
  }

  .support-section > .loading {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
  }
</style>

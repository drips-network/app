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
  import StreamStateBadge from '../stream-state-badge/stream-state-badge.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import tokensStore from '$lib/stores/tokens/tokens.store';

  export let dripList: DripList;
  export let representationalSplits: RepresentationalSplits;

  // TODO: Truncate the representational splits into a splits group after 4 items.
  // TODO: Display the monthly stream amount on top of the list.
  // TODO: Add top up and withdraw buttons.

  $: ownerAccountId = dripList.account.owner.accountId;
  $: supportStreams =
    $streamsStore &&
    streamsStore
      .getStreamsForUser(ownerAccountId)
      .outgoing.filter((s) => s.receiver.accountId === dripList.account.accountId);

  $: supportStream = supportStreams[0];
  $: supportStreamToken = supportStream
    ? tokensStore.getByAddress(supportStream?.streamConfig.amountPerSecond.tokenAddress)
    : undefined;

  $: accountEstimate = $balancesStore.accounts[ownerAccountId];
  $: outgoingEstimate = supportStream
    ? accountEstimate?.tokens[supportStream.streamConfig.amountPerSecond.tokenAddress.toLowerCase()]
    : undefined;
  $: totalStreamed = outgoingEstimate?.total.totals.totalStreamed;

  $: isOwnList = $walletStore && checkIsUser(dripList.account.owner.accountId);

  let loadingSupportStream = true;
  onMount(async () => {
    if (!$streamsStore.accounts[ownerAccountId]) {
      await streamsStore.fetchAccount(ownerAccountId);
    }

    loadingSupportStream = false;
  });

  function triggerEditModal() {
    modal.show(
      Stepper,
      undefined,
      editDripListSteps(dripList.account.accountId, representationalSplits),
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
    <div class="totals">
      <div class="drip-icon">
        <Drip />
      </div>
      {#if totalStreamed && supportStreamToken}
        <div class="total-streamed-badge">
          <span class="typo-text-mono"
            >{formatTokenAmount(totalStreamed, supportStreamToken.info.decimals)}
            {supportStreamToken.info.symbol}</span
          >
          <span class="muted">&nbsp;total</span>
        </div>
      {/if}
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
              modal.show(Stepper, undefined, editDripListStreamSteps(dripList.account.accountId))}
            >Edit stream</Button
          >
        {:else}
          <Button
            icon={TokenStreams}
            variant="primary"
            on:click={() =>
              modal.show(Stepper, undefined, createDripListStreamSteps(dripList.account.accountId))}
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
        <KeyValuePair size="medium" key="Status">
          <StreamStateBadge
            streamId={supportStream.id}
            paused={false}
            senderId={supportStream.sender.accountId}
            tokenAddress={supportStream.streamConfig.amountPerSecond.tokenAddress}
            size="small"
          />
        </KeyValuePair>
        <KeyValuePair size="medium" key="Token">
          <Token size="small" address={supportStream.streamConfig.amountPerSecond.tokenAddress} />
        </KeyValuePair>
        <KeyValuePair size="medium" key="Rate">
          <Amount amountPerSecond={supportStream.streamConfig.amountPerSecond} />
        </KeyValuePair>
        <KeyValuePair size="medium" key="Remaining Balance">
          {#if outgoingEstimate}
            <Amount
              amount={{
                tokenAddress: supportStream.streamConfig.amountPerSecond.tokenAddress,
                amount: outgoingEstimate.total.totals.remainingBalance,
              }}
            />
          {/if}
        </KeyValuePair>
      </div>
    {:else}
      <span class="muted">This Drip List isn't receiving any continuous support.</span>
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

  .totals {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .totals .drip-icon {
    width: 1.5rem;
  }

  .totals .total-streamed-badge {
    background-color: var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    align-items: last baseline;
    padding: 0.25rem 0.5rem;
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

  .muted {
    color: var(--color-foreground-level-5);
  }
</style>

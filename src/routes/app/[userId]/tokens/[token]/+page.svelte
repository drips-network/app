<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { page } from '$app/stores';
  import Token from '$lib/components/token/token.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowUp from 'radicle-design-system/icons/ArrowUp.svelte';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Minus from 'radicle-design-system/icons/Minus.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import balances from '$lib/stores/balances';
  import Amount from '$lib/components/amount/amount.svelte';
  import TokenStat from '$lib/components/token-stat/token-stat.svelte';
  import Streams from '../../../dashboard/sections/streams.section.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import modal from '$lib/stores/modal';
  import wallet from '$lib/stores/wallet';
  import guardConnected from '$lib/utils/guard-connected';
  import checkIsUser from '$lib/utils/check-is-user';
  import decodeUserId from '$lib/utils/decode-user-id';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import collectFlowSteps from '$lib/flows/collect-flow/collect-flow-steps';
  import getWithdrawSteps from '$lib/flows/withdraw-flow/withdraw-flow-steps';
  import topUpFlowSteps from '$lib/flows/top-up-flow/top-up-flow-steps';

  const urlParamToken = $page.params.token.toLowerCase();

  $: token = $tokens?.find(
    (token) =>
      token.info.address.toLowerCase() === urlParamToken ||
      token.info.symbol.toLowerCase() === urlParamToken,
  );

  $: tokenAddress = token?.info.address ?? urlParamToken;

  $: userId = $wallet.dripsUserId;

  $: outgoingEstimate =
    userId && $balances.accounts[userId]
      ? $balances.accounts[userId][tokenAddress] ?? null
      : undefined;

  $: incomingTotals =
    userId && tokenAddress && $balances
      ? balances.getIncomingTokenAmountsByUser(userId, tokenAddress) ?? null
      : undefined;

  function openCollectModal() {
    modal.show(Stepper, undefined, collectFlowSteps(tokenAddress));
  }

  function openAddFundsModal() {
    modal.show(Stepper, undefined, topUpFlowSteps(tokenAddress));
  }

  function openWithdrawModal() {
    modal.show(Stepper, undefined, getWithdrawSteps(tokenAddress));
  }

  let error: 'connected-to-wrong-user' | undefined;

  async function checkUrlUserId() {
    const decodedUrlUserId = await decodeUserId($page.params.userId);

    const connectedToRightUser = checkIsUser(decodedUrlUserId.dripsUserId);
    if (!connectedToRightUser) error = 'connected-to-wrong-user';
  }

  // redirect to connect page if disconnects
  $: {
    $wallet.connected;
    if (guardConnected()) checkUrlUserId();
  }

  $: actionsDisabled = !(outgoingEstimate && incomingTotals);
</script>

{#if error}
  <LargeEmptyState
    headline="Unable to view someone else's token page"
    description="Sorry, but you currently can only view your own token pages."
    emoji="💀"
  />
{:else}
  <article class="flex flex-col gap-16">
    <header>
      <div class="mb-5 flex">
        <a
          href="/app/dashboard"
          class="pl-2 py-1 pr-4 -ml-2 lg:-ml-9 rounded-full flex items-center typo-header-4 text-foreground-level-5 btn-theme-transparent"
        >
          <div class="w-8 h-8 flex items-center">
            <ArrowLeft />
          </div>
          Dashboard
        </a>
      </div>
      <h1>
        <Token address={tokenAddress} show="symbol" size="huge" fontSize="typo-header-1" />
      </h1>
    </header>

    <!-- balances -->
    <section class="grid sm:grid-cols-2 gap-3 lg:-mx-4">
      <h2 class="sr-only">Your Balances</h2>

      <TokenStat
        title="Incoming"
        tooltip="Your incoming balance is the cumulative total earned from any incoming streams for this token."
      >
        <svelte:fragment slot="detail">
          {#if incomingTotals && incomingTotals.amountPerSecond !== 0n}
            <Amount
              amountPerSecond={{ tokenAddress, amount: incomingTotals.amountPerSecond }}
              showSymbol={false}
            />
          {/if}
        </svelte:fragment>

        <svelte:fragment slot="value">
          {#if incomingTotals === undefined}
            <span class="animate-pulse">...</span>
          {:else}
            {@const amount = incomingTotals.totalEarned ?? 0n}
            <span class:text-foreground-level-4={amount === 0n}>
              <Amount amount={{ tokenAddress, amount }} showSymbol={false} amountClasses="" />
            </span>
          {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
          <div class="flex gap-3">
            <Button icon={ArrowUp} on:click={openCollectModal}>Collect</Button>
          </div>
        </svelte:fragment>
      </TokenStat>

      <TokenStat
        title="Outgoing"
        tooltip="Your outgoing balance is the remaining balance you can stream to others for this token."
      >
        <svelte:fragment slot="detail">
          {#if outgoingEstimate}
            <Amount
              amountPerSecond={{
                tokenAddress,
                amount: -outgoingEstimate.totals.totalAmountPerSecond,
              }}
              showSymbol={false}
            />
          {/if}
        </svelte:fragment>

        <svelte:fragment slot="value">
          {#if outgoingEstimate === undefined}
            <span class="animate-pulse">...</span>
          {:else}
            {@const amount = outgoingEstimate ? outgoingEstimate.totals.remainingBalance : 0n}
            <span class:text-foreground-level-4={amount === 0n}>
              <Amount amount={{ tokenAddress, amount }} showSymbol={false} amountClasses="" />
            </span>
          {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
          <div class="flex gap-1">
            <Button disabled={actionsDisabled} icon={Plus} on:click={openAddFundsModal}>Add</Button>
            <Button disabled={actionsDisabled} icon={Minus} on:click={openWithdrawModal}
              >Withdraw</Button
            >
          </div>
        </svelte:fragment>
      </TokenStat>
    </section>

    <Streams {userId} disableActions={false} {tokenAddress} />
  </article>
{/if}

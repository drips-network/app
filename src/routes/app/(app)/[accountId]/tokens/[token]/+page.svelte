<script lang="ts" context="module">
  export const TOKEN_PAGE_USER_BALANCES_FRAGMENT = gql`
    ${CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT}
    fragment TokenPageUserBalances on UserBalances {
      tokenAddress
      incoming {
        ...CurrentAmountsUserBalanceTimelineItem
      }
      outgoing {
        ...CurrentAmountsUserBalanceTimelineItem
      }
    }
  `;

  export const TOKEN_PAGE_USER_STREAMS_FRAGMENT = gql`
    ${STREAMS_SECTION_STREAMS_FRAGMENT}
    fragment TokenPageUserStreams on UserStreams {
      ...StreamsSectionStreams
    }
  `;
</script>

<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import { page } from '$app/stores';
  import Token from '$lib/components/token/token.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowUp from '$lib/components/icons/ArrowUp.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Minus from '$lib/components/icons/Minus.svelte';
  import Amount from '$lib/components/amount/amount.svelte';
  import TokenStat from '$lib/components/token-stat/token-stat.svelte';
  import Streams, {
    STREAMS_SECTION_STREAMS_FRAGMENT,
  } from '../../../funds/sections/streams.section.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import modal from '$lib/stores/modal';
  import wallet from '$lib/stores/wallet/wallet.store';
  import guardConnected from '$lib/utils/guard-connected';
  import checkIsUser from '$lib/utils/check-is-user';
  import decodeAccountId from '$lib/utils/decode-universal-account-id';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  // import collectFlowSteps from '$lib/flows/collect-flow/collect-flow-steps';
  import getWithdrawSteps from '$lib/flows/withdraw-flow/withdraw-flow-steps';
  import topUpFlowSteps from '$lib/flows/top-up-flow/top-up-flow-steps';
  import addCustomTokenFlowSteps from '$lib/flows/add-custom-token/add-custom-token-flow-steps';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { gql } from 'graphql-request';
  import {
    CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT,
    streamCurrentAmountsStore,
  } from '$lib/utils/current-amounts';

  export let data;

  $: urlParamToken = $page.params.token?.toLowerCase();

  $: tokenBalances = data.balances.find(
    (balance) => balance.tokenAddress.toLowerCase() === urlParamToken?.toLowerCase(),
  ) ?? { tokenAddress: urlParamToken, incoming: [], outgoing: [] };

  $: currentOutgoingAmountReadable = streamCurrentAmountsStore(
    tokenBalances.outgoing,
    urlParamToken,
  );
  $: currentIncomingAmountReadable = streamCurrentAmountsStore(
    tokenBalances.incoming,
    urlParamToken,
  );

  $: token = $tokens?.find(
    (token) =>
      token.info.address.toLowerCase() === urlParamToken ||
      token.info.symbol.toLowerCase() === urlParamToken,
  );

  $: tokenAddress = token?.info.address.toLowerCase() ?? urlParamToken;

  $: accountId = $wallet.dripsAccountId;

  // TODO(streams): make the modals work

  function openCollectModal() {
    // modal.show(Stepper, undefined, collectFlowSteps(tokenAddress));
  }

  function openAddFundsModal() {
    modal.show(Stepper, undefined, topUpFlowSteps(tokenAddress));
  }

  function openWithdrawModal() {
    modal.show(Stepper, undefined, getWithdrawSteps(tokenAddress));
  }

  let error: 'connected-to-wrong-user' | 'unknown-token' | undefined;

  async function checkUrlAccountId() {
    const decodedUrlAccountId = await decodeAccountId($page.params.accountId);

    const connectedToRightUser = checkIsUser(decodedUrlAccountId.dripsAccountId);
    if (!connectedToRightUser) return (error = 'connected-to-wrong-user');
    if (!token) return (error = 'unknown-token');
    error = undefined;
  }

  // redirect to connect page if disconnects
  $: {
    $wallet.connected;
    $tokens;
    if (guardConnected()) checkUrlAccountId();
  }
</script>

{#if token}
  <HeadMeta title={token?.info.name ?? 'Unknown Token'} />
{/if}

{#if error === 'unknown-token'}
  <LargeEmptyState
    headline="Unknown token"
    description="This token with address {tokenAddress} is not supported by default. You can manually add it to your custom tokens list."
    button={{
      handler: () => modal.show(Stepper, undefined, addCustomTokenFlowSteps(tokenAddress)),
      label: 'Add custom token',
    }}
    emoji="💀"
  />
{:else if tokenAddress}
  <article class="flex flex-col gap-16">
    <header class="flex gap-4 items-center">
      <Token address={tokenAddress} show="none" size="huge" fontSize="typo-header-1" />
      <div class="flex-col gap-2">
        <h1>
          {token?.info.name ?? 'Unknown token'}
        </h1>
        {#if token?.info.symbol}
          <h4 class="typo-text tabular-nums" style="color: var(--color-foreground-level-5)">
            {token.info.symbol}
          </h4>
        {/if}
      </div>
    </header>

    <!-- balances -->
    <section class="grid sm:grid-cols-2 gap-3">
      <h2 class="sr-only">Your Balances</h2>

      <TokenStat title="Incoming" tooltip="Amount received from others since your last withdrawal.">
        <svelte:fragment slot="detail">
          <Amount
            showSymbol={false}
            amountPerSecond={$currentIncomingAmountReadable.currentDeltaPerSecond}
          />
        </svelte:fragment>

        <svelte:fragment slot="value">
          <div data-testid="incoming-balance">
            <span class:text-foreground-level-4={true}>
              <Amount
                showSymbol={false}
                amount={$currentIncomingAmountReadable.currentAmount}
                amountClasses=""
              />
            </span>
          </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
          <div data-testid="token-page-collect-button" class="flex gap-3">
            <Button icon={ArrowUp} on:click={openCollectModal}>Collect</Button>
          </div>
        </svelte:fragment>
      </TokenStat>

      <TokenStat title="Outgoing" tooltip="Tokens available for streaming to others.">
        <svelte:fragment slot="detail">
          <Amount
            showSymbol={false}
            amountPerSecond={$currentOutgoingAmountReadable.currentDeltaPerSecond}
          />
        </svelte:fragment>

        <svelte:fragment slot="value">
          <div data-testid="outgoing-balance">
            <span
              class:text-foreground-level-4={$currentOutgoingAmountReadable.currentAmount.amount ===
                0n}
            >
              <Amount
                showSymbol={false}
                amount={$currentOutgoingAmountReadable.currentAmount}
                amountClasses=""
              />
            </span>
          </div>
        </svelte:fragment>

        <svelte:fragment slot="actions">
          <div class="flex gap-2">
            <Button icon={Plus} on:click={openAddFundsModal}>Add</Button>
            <Button
              disabled={!$currentOutgoingAmountReadable.currentAmount.amount}
              icon={Minus}
              on:click={openWithdrawModal}>Withdraw</Button
            >
          </div>
        </svelte:fragment>
      </TokenStat>
    </section>

    <Streams userStreams={data.streams} {accountId} disableActions={false} {tokenAddress} />
  </article>
{/if}

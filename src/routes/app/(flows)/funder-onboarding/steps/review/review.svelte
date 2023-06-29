<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import ListIcon from 'radicle-design-system/icons/Ledger.svelte';
  import TransactionsIcon from 'radicle-design-system/icons/Transactions.svelte';
  import type { Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import Token from '$lib/components/token/token.svelte';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import CoinIcon from 'radicle-design-system/icons/Coin.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import assert from '$lib/utils/assert';
  import formatDate from '$lib/utils/format-date';
  import DripListService from '$lib/utils/driplist/DripListService';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import type { State } from '../../funder-onboarding-flow';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import { goto } from '$app/navigation';
  import expect from '$lib/utils/expect';
  import type { DripsSubgraphClient } from 'radicle-drips';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import streamsStore from '$lib/stores/streams/streams.store';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  let streamRateValueParsed: bigint | undefined, topUpAmountValueParsed: bigint | undefined;
  $: ({ streamRateValueParsed, topUpAmountValueParsed } = $context.supportConfig);

  $: tokenAddress = $context.supportConfig.listSelected[0] ?? unreachable();
  $: token = tokensStore.getByAddress(tokenAddress) ?? unreachable();

  let lastsUntil: string | undefined;
  $: {
    assert(streamRateValueParsed !== undefined && topUpAmountValueParsed !== undefined);

    const durationSeconds = topUpAmountValueParsed / streamRateValueParsed;

    const timestamp = new Date(Date.now() + Number(durationSeconds) * 1000);

    lastsUntil =
      topUpAmountValueParsed > 0 ? `≈ ${formatDate(timestamp, 'dayAndYear')}` : undefined;
  }

  let dripListService: DripListService;
  let subgraphClient: DripsSubgraphClient;

  onMount(async () => {
    dripListService = await DripListService.new();
    subgraphClient = getSubgraphClient();
  });

  async function createDripList() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const transactContext = await dripListService.buildTransactContext($context);

          return transactContext;
        },
        transactions: ({ callerClient, approvalFlowTxs, normalFlowTxs, needsApproval }) => {
          if (needsApproval) {
            return approvalFlowTxs;
          } else {
            return {
              transaction: () =>
                callerClient.callBatched(normalFlowTxs.txs, {
                  gasLimit: normalFlowTxs.gasLimitWithBuffer,
                }),
            };
          }
        },
        after: async (_, { callerClient, dripListId }) => {
          await expect(
            async () =>
              subgraphClient.getNftSubAccountsByOwner(await callerClient.signer.getAddress()),
            (subAccounts) => subAccounts.filter((s) => s.tokenId === dripListId).length === 1,
            10000,
            1000,
          );
          await streamsStore.refreshUserAccount();
          goto(`${await callerClient.signer.getAddress()}/tokens/${token.info.address}`);
        },
      }),
    );
  }
</script>

<StandaloneFlowStepLayout
  description="Review your new Drip List, monthly support, and initial top-up amount."
>
  <FormField type="div" title="Your Drip List">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -2 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <ListEditor
      bind:percentages={$context.dripList.percentages}
      bind:selected={$context.dripList.selected}
      bind:items={$context.dripList.items}
      blockInteraction
    />
  </FormField>
  <FormField type="div" title="Your support">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -1 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <div class="card">
      <div class="key-value-row">
        <div class="key-value-pair">
          <h5 class="key">Token</h5>
          <span class="value"><Token address={tokenAddress} size="small" /></span>
        </div>
        <div class="key-value-pair">
          <h5 class="key">Stream rate</h5>
          <span class="value typo-text-mono"
            >{formatTokenAmount(
              streamRateValueParsed ?? unreachable(),
              token.info.decimals,
              undefined,
              false,
            )}
            <span class="muted">{token.info.symbol}/mo</span></span
          >
        </div>
      </div>
      <div class="key-value-row">
        <div class="key-value-pair">
          <h5 class="key">Initial top-up</h5>
          <span class="value typo-text-mono"
            >{formatTokenAmount(
              topUpAmountValueParsed ?? unreachable(),
              token.info.decimals,
              1n,
              false,
            )} <span class="muted">{token.info.symbol}</span></span
          >
        </div>
        {#if lastsUntil}
          <div class="key-value-pair">
            <h5 class="key">Lasts until</h5>
            <span class="value typo-text">{lastsUntil}</span>
          </div>
        {/if}
      </div>
    </div>
  </FormField>
  <FormField type="div" title="Your connected wallet">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -1 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <AccountBox hideDisconnect />
  </FormField>
  <div class="whats-next">
    <div class="card">
      <h4>On transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={TransactionsIcon}
          ><span class="typo-text-bold"
            >{$context.supportConfig.topUpAmountValue}
            {token.info.symbol} will be transferred from your wallet into your Drips account</span
          >
          and immediately begin streaming to your Drip List recipients at a rate of
          <span class="typo-text-bold"
            >{$context.supportConfig.streamRateValue} {token.info.symbol} per month</span
          >.</UlIconLi
        >
        <UlIconLi icon={ListIcon}
          >Your new Drip List will appear on your <span class="typo-text-bold">public profile</span
          >.</UlIconLi
        >
      </ul>
    </div>
    <div class="card">
      <h4>After transaction confirmation…</h4>
      <ul>
        <UlIconLi icon={CoinIcon}
          ><span class="typo-text-bold">Add funds</span> (or withdraw any unstreamed funds) from your
          Drips dashboard.</UlIconLi
        >
        <UlIconLi icon={ListIcon}
          ><span class="typo-text-bold">Pause or cancel</span> your support anytime.</UlIconLi
        >
        <UlIconLi icon={PenIcon}
          ><span class="typo-text-bold">Edit</span> your Drip List anytime.</UlIconLi
        >
      </ul>
    </div>
  </div>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Go back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button icon={WalletIcon} variant="primary" on:click={createDripList}>Confirm in wallet</Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .card {
    background-color: var(--color-background);
    padding: 1rem;
    box-shadow: var(--elevation-low);
    border-radius: 1.5rem 0 1.5rem 1.5rem;
    display: flex;
    gap: 0.5rem;
    flex-direction: column;
  }

  .key-value-row {
    display: flex;
    gap: 1rem;
  }

  .key-value-row:not(:last-child) {
    margin-bottom: 1rem;
  }

  .key-value-pair {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 50%;
  }

  .key-value-pair h5 {
    color: var(--color-foreground-level-6);
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .whats-next {
    display: flex;
    gap: 1rem;
    flex-direction: column;
  }

  .muted {
    color: var(--color-foreground-level-6);
  }
</style>

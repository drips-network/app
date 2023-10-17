<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from '$lib/components/account-box/account-box.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import PenIcon from 'radicle-design-system/icons/Pen.svelte';
  import ListIcon from 'radicle-design-system/icons/DripList.svelte';
  import TransactionsIcon from 'radicle-design-system/icons/Transactions.svelte';
  import type { Writable } from 'svelte/store';
  import unreachable from '$lib/utils/unreachable';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import UlIconLi from '$lib/components/ul-icon-li/ul-icon-li.svelte';
  import CoinIcon from 'radicle-design-system/icons/Coin.svelte';
  import WalletIcon from 'radicle-design-system/icons/Wallet.svelte';
  import DripListService from '$lib/utils/driplist/DripListService';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import type { State } from '../../funder-onboarding-flow';
  import ListEditor from '$lib/components/drip-list-members-editor/drip-list-members-editor.svelte';
  import expect from '$lib/utils/expect';
  import type { DripsSubgraphClient } from 'radicle-drips';
  import { getSubgraphClient } from '$lib/utils/get-drips-clients';
  import streamsStore from '$lib/stores/streams/streams.store';
  import Pause from 'radicle-design-system/icons/Pause.svelte';
  import ContinuousSupportReviewCard from './components/continuous-support-review-card.svelte';
  import TokenStreams from 'radicle-design-system/icons/TokenStreams.svelte';
  import assert from '$lib/utils/assert';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

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
            assert(
              approvalFlowTxs,
              "needsApproval is true, but dripListService didn't build `approvalFlowTxs`",
            );
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
        },
      }),
    );
  }

  function goBack() {
    switch ($context.selectedSupportOption) {
      case 1: {
        dispatch('goBackward');
        break;
      }
      case 2: {
        // Skip the support type selection step
        dispatch('goForward', { by: -2 });
        break;
      }
      case undefined: {
        unreachable();
      }
    }
  }
</script>

<StandaloneFlowStepLayout headline="Review" description="Here's everything you set up.">
  <FormField type="div" title="Your Drip List">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -4 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <h2 class="pixelated drip-list-title">{$context.dripList.title}</h2>
    {#if ($context.dripList.description ?? '').length > 0}
      <p class="my-4">{$context.dripList.description}</p>
    {/if}
    <ListEditor
      bind:percentages={$context.dripList.percentages}
      bind:items={$context.dripList.items}
      isEditable={false}
    />
  </FormField>
  {#if $context.selectedSupportOption === 1}
    <FormField type="div" title="Your support">
      <svelte:fragment slot="action">
        <Button variant="ghost" on:click={() => dispatch('goForward', { by: -1 })} icon={PenIcon}
          >Edit</Button
        >
      </svelte:fragment>
      <div class="card">
        <ContinuousSupportReviewCard {context} />
      </div>
    </FormField>
  {/if}
  <FormField type="div" title="Your connected wallet">
    <svelte:fragment slot="action">
      <Button variant="ghost" on:click={() => dispatch('goForward', { by: -3 })} icon={PenIcon}
        >Edit</Button
      >
    </svelte:fragment>
    <AccountBox hideDisconnect />
  </FormField>
  <div class="whats-next">
    <div class="card">
      <h4>On transaction confirmation…</h4>
      <ul>
        {#if $context.continuousSupportConfig.topUpAmountValueParsed && $context.continuousSupportConfig.streamRateValueParsed && $context.continuousSupportConfig.listSelected[0]}
          {@const token =
            tokensStore.getByAddress($context.continuousSupportConfig.listSelected[0]) ??
            unreachable()}
          <UlIconLi icon={TransactionsIcon}>
            <span class="typo-text-bold">
              {formatTokenAmount(
                $context.continuousSupportConfig.topUpAmountValueParsed,
                token.info.decimals,
                1n,
                false,
              )}
              {token.info.symbol} will be transferred from your wallet into your Drips account</span
            >
            and immediately begin streaming to your Drip List recipients at a rate of
            <span class="typo-text-bold">
              {formatTokenAmount(
                $context.continuousSupportConfig.streamRateValueParsed,
                token.info.decimals,
                undefined,
                false,
              )}
              {token.info.symbol} per month</span
            >.
          </UlIconLi>
        {/if}
        <UlIconLi icon={ListIcon}
          >Your new Drip List will appear on your <span class="typo-text-bold">public profile</span
          >.</UlIconLi
        >
      </ul>
    </div>
    <div class="card">
      <h4>After transaction confirmation…</h4>
      <ul>
        {#if $context.selectedSupportOption === 1}
          <UlIconLi icon={CoinIcon}>
            <span class="typo-text-bold">Add funds</span> (or withdraw any unstreamed funds) from your
            Drips dashboard.
          </UlIconLi>
          <UlIconLi icon={Pause}>
            <span class="typo-text-bold">Pause or cancel</span> your support anytime.
          </UlIconLi>
        {/if}
        {#if $context.selectedSupportOption === 2}
          <UlIconLi icon={TokenStreams}>
            You can <span class="typo-text-bold">start supporting</span> your Drip List anytime.
          </UlIconLi>
        {/if}
        <UlIconLi icon={PenIcon}
          ><span class="typo-text-bold">Edit</span> your Drip List anytime.</UlIconLi
        >
      </ul>
    </div>
  </div>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={goBack}>Back</Button>
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

  .drip-list-title {
    margin-bottom: 1rem;
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
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import Token from '$lib/components/token/token.svelte';
  import tokens from '$lib/stores/tokens';
  import type { TokenInfoWrapper } from '$lib/stores/tokens/tokens.store';
  import wallet from '$lib/stores/wallet';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { ManageStreamingBalanceFlowState } from './manage-streaming-balance-flow-state';
  import assert from '$lib/utils/assert';
  import balances from '$lib/stores/balances/balances.store';
  import Amount from '$lib/components/amount/amount.svelte';
  import type { UserId } from '$lib/stores/streams/types';
  import TabSwitcher from '$lib/components/tab-switcher/tab-switcher.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<ManageStreamingBalanceFlowState>;
  export let userId: UserId;

  let tokenList: Items;

  function buildTokenList() {
    const getBalance = (tokenAddress: string) =>
      $balances.accounts[userId][tokenAddress]?.totals.remainingBalance ?? 0n;

    const myTokens =
      $tokens?.map((token: TokenInfoWrapper) => [
        token.info.address,
        {
          type: 'selectable',
          label: token.info.symbol,
          text: {
            component: Amount,
            props: {
              amount: {
                tokenAddress: token.info.address,
                amount: getBalance(token.info.address),
              },
              amountPerSecond: {
                tokenAddress: token.info.address,
                amount: -(
                  $balances.accounts[userId][token.info.address]?.totals.totalAmountPerSecond ?? 0n
                ),
              },
              showSymbol: false,
              showAmountPerSecond: false,
            },
          },
          image: {
            component: Token,
            props: {
              show: 'none',
              address: token.info.address,
              size: 'small',
            },
          },
        },
      ]) ?? [];

    // sort by balance
    myTokens.sort((a: any[], b: any[]) => {
      return Number(getBalance(b[0]) - getBalance(a[0]));
    });

    tokenList = Object.fromEntries(myTokens);
  }

  $: {
    $balances;
    buildTokenList();
  }

  let selected: string[] = [];
  $: selectedToken = selected[0] ? tokens.getByAddress(selected[0]) : undefined;

  async function updateContext() {
    const tokenAddress = selected[0];

    const { address } = $wallet;
    assert(address);

    context.update((c) => ({
      ...c,
      tokenAddress,
    }));
  }

  function submit() {
    dispatch('await', {
      message: `Confirming…`,
      promise: () => updateContext(),
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🚰"
    headline="Manage Streaming Balances"
    description="Add or withdraw funds from your account's streaming balance."
  />
  <FormField title="Select token">
    <div class="token-list-container">
      <ListSelect bind:selected items={tokenList} />
    </div>
  </FormField>
  <TabSwitcher options={['Add Funds', 'Withdraw']} />
  <svelte:fragment slot="actions">
    <Button disabled={selected.length !== 1} on:click={submit}>Continue</Button>
  </svelte:fragment>
</StepLayout>

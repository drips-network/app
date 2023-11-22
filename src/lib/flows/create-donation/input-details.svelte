<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import wallet from '$lib/stores/wallet/wallet.store';
  import DripVisual from '$lib/components/drip-visual/drip-visual.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import Token from '$lib/components/token/token.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import InputAddress from '$lib/components/input-address/input-address.svelte';
  import type { Writable } from 'svelte/store';
  import SafeAppDisclaimer from '$lib/components/safe-app-disclaimer/safe-app-disclaimer.svelte';
  import type { CreateDonationFlowState } from './create-donation-flow-state';
  import type {
    NFTDriverAccount,
    RepoDriverAccount,
  } from '$lib/components/drip-visual/drip-visual.svelte';
  import InputWalletAmount from '$lib/components/input-wallet-amount/input-wallet-amount.svelte';
  import { fetchBalance } from '$lib/utils/erc20';
  import assert from '$lib/utils/assert';
  import createDonation from './methods/create-donation';
  import unreachable from '$lib/utils/unreachable';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import type { AddressDriverAccount } from '$lib/stores/streams/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateDonationFlowState>;
  export let receiver: NFTDriverAccount | AddressDriverAccount | RepoDriverAccount | undefined =
    undefined;
  export let tokenAddress: string | undefined = undefined;

  const restorer = $context.restorer;

  // Recipient Address

  let recipientInputValue = receiver?.accountId ?? restorer.restore('recipientInputValue');
  let recipientInputValidationState: TextInputValidationState = { type: 'unvalidated' };

  function onRecipientInputValidationChange(event: CustomEvent) {
    recipientInputValidationState = event.detail ?? { type: 'unvalidated' };
  }

  // Token list

  let tokenList: Items;
  $: tokenList = {
    ...Object.fromEntries(
      $tokens?.map((token) => [
        token.info.address,
        {
          type: 'selectable',
          searchString: [token.info.name, token.info.symbol],
          label: token.info.name,
          text: token.info.symbol,
          image: {
            component: Token,
            props: {
              show: 'none',
              address: token.info.address,
              size: 'small',
            },
          },
        },
      ]) ?? [],
    ),
  };

  // Selected Token

  let selectedTokenAddress: string[] =
    restorer.restore('selectedTokenAddress') ?? (tokenAddress ? [tokenAddress.toLowerCase()] : []);

  let selectedTokenBalance: bigint | undefined;
  let selectedTokenAllowance: bigint | undefined;

  let loadingToken = false;

  async function getSelectedTokenBalance() {
    const tokenAddress = selectedTokenAddress[0];
    if (!tokenAddress) return;
    loadingToken = true;
    selectedTokenBalance = undefined;

    const { address, provider } = $wallet;
    assert(address && tokenAddress);

    selectedTokenAllowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);
    selectedTokenBalance = await fetchBalance(tokenAddress, address, provider);
    loadingToken = false;
  }

  $: {
    selectedTokenAddress, getSelectedTokenBalance();
  }

  // Amount input

  let amountInputValue = restorer.restore('amountInputValue') ?? '0';
  let amount: bigint | undefined = undefined;
  let topUpMax = restorer.restore('topUpMax');

  let amountValidationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  //

  $: formValid =
    (receiver || recipientInputValidationState.type === 'valid') &&
    amountValidationState.type === 'valid';

  function submit() {
    createDonation(
      dispatch,
      recipientInputValue ?? unreachable(),
      selectedTokenAddress[0] ?? unreachable(),
      amount ?? unreachable(),
      selectedTokenAllowance ?? unreachable(),
    );
  }

  $: restorer.saveAll({
    amountInputValue,
    selectedTokenAddress,
    recipientInputValue,
    topUpMax,
  });
</script>

<StepLayout>
  <DripVisual
    disableLinks
    visual="donation"
    from={$wallet.address
      ? {
          driver: 'address',
          address: $wallet.address,
        }
      : undefined}
    to={receiver
      ? receiver
      : recipientInputValidationState.type === 'valid' && recipientInputValue
      ? {
          driver: 'address',
          address: recipientInputValue,
        }
      : undefined}
    halted={amountValidationState.type !== 'valid'}
  />
  <StepHeader
    headline="Donate instantly"
    description="Choose a token and how much you would like to donate."
  />
  {#if !receiver}
    <FormField title="Donate to*">
      <InputAddress
        bind:value={recipientInputValue}
        on:validationChange={onRecipientInputValidationChange}
      />
    </FormField>
  {/if}
  <FormField title="Token*">
    <div class="list-container">
      <ListSelect
        bind:selected={selectedTokenAddress}
        searchable={true}
        items={tokenList}
        type="tokens"
      />
    </div>
  </FormField>
  <div
    class="flex flex-col gap-6 {!selectedTokenAddress[0] ? 'opacity-50 pointer-events-none' : ''}"
  >
    <InputWalletAmount
      tokenAddress={selectedTokenAddress[0]}
      tokenBalance={selectedTokenBalance}
      bind:inputValue={amountInputValue}
      bind:amount
      bind:topUpMax
      bind:validationState={amountValidationState}
      loading={loadingToken}
    />
  </div>
  <SafeAppDisclaimer disclaimerType="drips" />
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" on:click={submit} disabled={!formValid}>Confirm in your wallet</Button
    >
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    max-height: 24rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
  }
</style>

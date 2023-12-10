<script lang="ts">
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { fetchBalance } from '$lib/utils/erc20';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import FormField from '../form-field/form-field.svelte';
  import InputWalletAmount from '../input-wallet-amount/input-wallet-amount.svelte';
  import ListSelect from '../list-select/list-select.svelte';
  import Token from '../token/token.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import type { Items } from '../list-select/list-select.types';
  import assert from '$lib/utils/assert';

  export let selectedTokenAddress: string[] = [];

  // Token list

  let tokenList: Items;
  $: tokenList = {
    ...Object.fromEntries(
      $tokensStore?.map((token) => [
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

  // Amount input

  export let amountInputValue: string;
  export let amount: bigint | undefined = undefined;
  export let topUpMax: boolean;

  let amountValidationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  export let selectedTokenBalance: bigint | undefined = undefined;
  export let selectedTokenAllowance: bigint | undefined = undefined;

  let loadingToken = false;

  let prevTokenAddress: string | undefined;
  async function getSelectedTokenBalance() {
    const tokenAddress = selectedTokenAddress[0];

    if (tokenAddress === prevTokenAddress) return;
    if (!tokenAddress) return;

    loadingToken = true;
    selectedTokenBalance = undefined;

    const { address, provider } = $walletStore;
    assert(address && tokenAddress);

    selectedTokenAllowance = await (await getAddressDriverClient()).getAllowance(tokenAddress);
    selectedTokenBalance = await fetchBalance(tokenAddress, address, provider);
    loadingToken = false;
    prevTokenAddress = tokenAddress;
  }

  $: {
    selectedTokenAddress;
    getSelectedTokenBalance();
  }

  export let formValid: boolean;
  $: formValid = amountValidationState.type === 'valid';
</script>

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
<div class="flex flex-col gap-6 {!selectedTokenAddress[0] ? 'opacity-50 pointer-events-none' : ''}">
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

<style>
  .list-container {
    max-height: 24rem;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
  }
</style>

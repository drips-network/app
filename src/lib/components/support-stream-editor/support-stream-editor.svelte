<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Button from '../button/button.svelte';
  import unreachable from '$lib/utils/unreachable';
  import Token from '../token/token.svelte';
  import { formatUnits } from 'ethers';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';
  import { executeErc20ReadMethod } from '$lib/utils/sdk/erc20/erc20';
  import type { OxString } from '$lib/utils/sdk/sdk-types';

  export let streamRateValueParsed: bigint | undefined = undefined;
  export let topUpAmountValueParsed: bigint | undefined = undefined;

  export let disabled = false;
  export let selectedTokenAddress: string | undefined = undefined;
  $: selectedToken = selectedTokenAddress
    ? tokensStore.getByAddress(selectedTokenAddress)
    : undefined;

  let tokenListSelected = selectedTokenAddress ? [selectedTokenAddress] : [];
  $: selectedTokenAddress = tokenListSelected[0];

  let streamRateValue =
    selectedTokenAddress && streamRateValueParsed
      ? formatUnits(
          streamRateValueParsed,
          (tokensStore.getByAddress(selectedTokenAddress)?.info.decimals ?? unreachable()) +
            contractConstants.AMT_PER_SEC_EXTRA_DECIMALS,
        )
      : '';
  let topUpAmountValue =
    selectedTokenAddress && topUpAmountValueParsed
      ? formatUnits(
          topUpAmountValueParsed,
          tokensStore.getByAddress(selectedTokenAddress)?.info.decimals ?? unreachable(),
        )
      : '';

  // If top up is disabled, the token list should only show available token balances to stream.
  let tokenList: Items = {};

  $: tokenList = Object.fromEntries(
    $tokensStore?.map((token) => {
      const { address, name, symbol } = token.info;

      return [
        address,
        {
          type: 'selectable',
          label: name,
          text: symbol,
          searchString: [token.info.name, token.info.symbol],
          image: {
            component: Token,
            props: {
              show: 'none',
              address: address,
              size: 'small',
            },
          },
        },
      ];
    }) ?? [],
  );

  // –––––––––––––––––––––––––
  // FETCH ERC-20 BALANCES IN BACKGROUND

  let fetchedBalances: { [tokenAddress: string]: bigint } = {};

  function fetchSelectedErc20Balance() {
    const { address } = $walletStore;
    assert(selectedToken && address);

    return executeErc20ReadMethod({
      functionName: 'balanceOf',
      token: selectedToken.info.address as OxString,
      args: [address as OxString],
    });
  }

  $: {
    if (selectedToken && !(selectedToken.info.address in fetchedBalances)) {
      fetchSelectedErc20Balance().then((balance) => {
        assert(selectedToken);

        fetchedBalances = {
          ...fetchedBalances,
          [selectedToken.info.address]: balance,
        };
      });
    }
  }

  // –––––––––––––––––––––––––
  // STREAM RATE VALUE

  $: {
    if (selectedToken) {
      streamRateValueParsed =
        streamRateValue && selectedToken
          ? parseTokenAmount(
              streamRateValue,
              selectedToken.info.decimals + contractConstants.AMT_PER_SEC_EXTRA_DECIMALS,
            )
          : undefined;
    }
  }

  let streamRateValueValidation: TextInputValidationState;
  $: {
    if (!streamRateValueParsed) {
      streamRateValueValidation = {
        type: 'unvalidated',
      };
    } else {
      streamRateValueValidation = validateAmtPerSecInput(streamRateValueParsed);
    }
  }

  // –––––––––––––––––––––––––
  // TOP UP AMOUNT VALUE

  $: {
    if (selectedToken) {
      topUpAmountValueParsed =
        topUpAmountValue && selectedToken
          ? parseTokenAmount(topUpAmountValue, selectedToken.info.decimals)
          : undefined;
    }
  }

  let topUpAmountValueValidation: TextInputValidationState;
  $: {
    if (topUpAmountValueParsed === undefined) {
      topUpAmountValueValidation = {
        type: 'unvalidated',
      };
    } else if (!selectedToken || fetchedBalances[selectedToken.info.address] === undefined) {
      topUpAmountValueValidation = {
        type: 'pending',
      };
    } else if (topUpAmountValueParsed > (fetchedBalances[selectedToken.info.address] ?? 0n)) {
      topUpAmountValueValidation = {
        type: 'invalid',
        message: `You only have ${formatTokenAmount(
          fetchedBalances[selectedToken.info.address],
          selectedToken.info.decimals,
          1n,
          false,
        )} ${selectedToken.info.symbol} available`,
      };
    } else {
      topUpAmountValueValidation = {
        type: 'valid',
      };
    }
  }

  // –––––––––––––––––––––––––
  // STAGE LOGIC

  enum Stage {
    COMPLETELY_DISABLED,
    SELECT_TOKEN,
    SET_STREAM_RATE,
    SET_TOP_UP_AMOUNT,
  }

  let currentStage: Stage = 0;
  $: {
    if (disabled) {
      currentStage = Stage.COMPLETELY_DISABLED;
    } else if ($walletStore.connected && selectedToken && streamRateValue !== '') {
      currentStage = Stage.SET_TOP_UP_AMOUNT;
    } else if ($walletStore.connected && selectedToken) {
      currentStage = Stage.SET_STREAM_RATE;
    } else if ($walletStore.connected) {
      currentStage = Stage.SELECT_TOKEN;
    }
  }

  // –––––––––––––––––––––––––
  // ACTIONS

  function applyMaxTopUp() {
    assert(selectedToken);
    const { decimals } = selectedToken.info;

    topUpAmountValue = formatUnits(fetchedBalances[selectedToken.info.address] ?? 0n, decimals);
  }

  function applyTopUpSuggestion(months: number) {
    assert(selectedToken);
    const { decimals } = selectedToken.info;

    topUpAmountValue = formatUnits(
      ((streamRateValueParsed ?? 0n) / BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER)) *
        BigInt(months),
      decimals,
    );
  }

  // –––––––––––––––––––––––––
  // FORM VALIDATION

  export let formValid: boolean;
  $: formValid =
    currentStage === 3 &&
    streamRateValueValidation.type === 'valid' &&
    (streamRateValueParsed ?? 0n) > 0n &&
    topUpAmountValueValidation.type === 'valid';
</script>

<FormField type="div" disabled={currentStage < 1} title="Select a token to stream">
  <div class="list-container">
    <ListSelect
      type="tokens"
      blockInteraction={currentStage < 1}
      bind:selected={tokenListSelected}
      items={tokenList}
    />
  </div>
</FormField>

<FormField
  disabled={currentStage < 2}
  title="Set a monthly stream rate"
  description="Your tokens will be streamed to your Split List by-the-second. You can pause, cancel or edit the rate at any time."
>
  <TextInput
    variant={{ type: 'number', min: 0 }}
    bind:value={streamRateValue}
    disabled={currentStage < 2}
    validationState={streamRateValueValidation}
    placeholder="Amount"
    suffix={selectedToken ? `${selectedToken.info.symbol}/mo` : ''}
  />
</FormField>

<FormField
  disabled={currentStage < 3}
  title="Initial top-up"
  description="You can add or withdraw funds at any time."
>
  <TextInput
    variant={{ type: 'number', min: 0 }}
    bind:value={topUpAmountValue}
    disabled={currentStage < 3}
    placeholder="Amount"
    validationState={topUpAmountValueValidation}
    suffix={selectedToken ? `${selectedToken.info.symbol}` : ''}
  />
  <div class="suggestions">
    <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(1)}>1 month</Button>
    <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(3)}>3 months</Button>
    <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(6)}>6 months</Button>
    <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(12)}>1 year</Button>
    <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(24)}>2 years</Button>
    <Button
      disabled={selectedToken && fetchedBalances[selectedToken?.info.address] === undefined}
      on:click={applyMaxTopUp}>Max</Button
    >
  </div>
</FormField>

<style>
  .list-container {
    height: 14rem;
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
    box-shadow: var(--elevation-low);
  }

  .suggestions {
    margin-top: 1rem;
    flex-wrap: wrap;
    display: flex;
    gap: 0.5rem;
  }
</style>

<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Token from '$lib/components/token/token.svelte';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import AccountBox from './components/account-box.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { fetchBalance } from '$lib/utils/erc20';
  import assert from '$lib/utils/assert';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import { constants } from 'radicle-drips';
  import { formatUnits } from 'ethers/lib/utils';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import { validateAmtPerSecInput } from '$lib/utils/validate-amt-per-sec';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import unreachable from '$lib/utils/unreachable';

  const dispatch = createEventDispatcher<StepComponentEvents>();

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

  let listSelected: string[] = [];
  $: selectedToken = listSelected[0];
  let fetchedBalances: { [tokenAddress: string]: bigint } = {};

  function fetchSelectedErc20Balance() {
    const { address, provider } = $walletStore;
    assert(selectedToken && address);

    return fetchBalance(selectedToken, address, provider);
  }

  $: {
    if (selectedToken && !(selectedToken in fetchedBalances)) {
      fetchSelectedErc20Balance().then((balance) => {
        fetchedBalances = {
          ...fetchedBalances,
          [selectedToken]: balance,
        };
      });
    }
  }

  // –––––––––––––––––––––––––
  // STREAM RATE VALUE

  let streamRateValue = '';
  let streamRateValueParsed: bigint | undefined = undefined;
  $: {
    if (selectedToken) {
      const token = tokensStore.getByAddress(selectedToken);
      assert(token);

      streamRateValueParsed =
        streamRateValue && selectedToken
          ? parseTokenAmount(
              streamRateValue,
              token.info.decimals + constants.AMT_PER_SEC_EXTRA_DECIMALS,
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

  let topUpAmountValue = '';
  let topUpAmountValueParsed: bigint | undefined = undefined;
  $: {
    if (selectedToken) {
      const token = tokensStore.getByAddress(selectedToken);
      assert(token);

      topUpAmountValueParsed =
        topUpAmountValue && selectedToken
          ? parseTokenAmount(topUpAmountValue, token.info.decimals)
          : undefined;
    }
  }

  let topUpAmountValueValidation: TextInputValidationState;
  $: {
    if (topUpAmountValueParsed === undefined) {
      topUpAmountValueValidation = {
        type: 'unvalidated',
      };
    } else if (fetchedBalances[selectedToken] === undefined) {
      topUpAmountValueValidation = {
        type: 'pending',
      };
    } else if (topUpAmountValueParsed > (fetchedBalances[selectedToken] ?? 0n)) {
      const token = tokensStore.getByAddress(selectedToken) ?? unreachable();

      topUpAmountValueValidation = {
        type: 'invalid',
        message: `You only have ${formatTokenAmount(
          fetchedBalances[selectedToken],
          token.info.decimals,
        )} ${token.info.symbol} available`,
      };
    } else {
      topUpAmountValueValidation = {
        type: 'valid',
      };
    }
  }

  function applyTopUpSuggestion(months: number) {
    assert(selectedToken);
    const token = tokensStore.getByAddress(selectedToken);
    assert(token);
    const { decimals } = token.info;

    topUpAmountValue = formatUnits(
      ((streamRateValueParsed ?? 0n) / BigInt(constants.AMT_PER_SEC_MULTIPLIER)) * BigInt(months),
      decimals,
    );
  }

  function applyMaxTopUp() {
    assert(selectedToken);
    const token = tokensStore.getByAddress(selectedToken);
    assert(token);
    const { decimals } = token.info;

    topUpAmountValue = formatUnits(fetchedBalances[selectedToken] ?? 0n, decimals);
  }

  // –––––––––––––––––––––––––

  // Stages:
  // 0: 'connect-wallet',
  // 1: 'select-token',
  // 2: 'set-stream-rate',
  // 3: 'set-top-up-amount'
  let currentStage = 0;
  $: {
    if ($walletStore.connected && selectedToken && streamRateValue !== '') {
      currentStage = 3;
    } else if ($walletStore.connected && selectedToken) {
      currentStage = 2;
    } else if ($walletStore.connected) {
      currentStage = 1;
    } else {
      currentStage = 0;
    }
  }

  $: formValid =
    currentStage === 3 &&
    streamRateValueValidation.type === 'valid' &&
    (streamRateValueParsed ?? 0n) > 0n &&
    topUpAmountValueValidation.type === 'valid';
</script>

<StandaloneFlowStepLayout
  headline="Support your Drip List"
  subtitle="Set up a stream to support the projects on your Drip List."
>
  <AnnotationBox type="info">
    <div class="support-type-explainer">
      <h4 class="typo-text-small-bold">Support monthly with token streaming</h4>
      <ul>
        <li>Stream a custom amount of any ERC-20 token</li>
        <li>Cancel, pause or edit the stream rate anytime</li>
        <li>Top up or withdraw tokens from your stream balance anytime</li>
      </ul>
    </div>
  </AnnotationBox>
  <FormField type="div" title="Wallet">
    <AccountBox />
  </FormField>
  <FormField type="div" disabled={currentStage < 1} title="Select a token to stream">
    <div class="list-container">
      <ListSelect
        blockInteraction={currentStage < 1}
        bind:selected={listSelected}
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
      suffix={listSelected[0] ? `${tokensStore.getByAddress(listSelected[0])?.info.symbol}/mo` : ''}
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
      suffix={listSelected[0] ? `${tokensStore.getByAddress(listSelected[0])?.info.symbol}` : ''}
    />
    <div class="suggestions">
      <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(1)}>1 month</Button>
      <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(3)}>3 months</Button>
      <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(6)}>6 months</Button>
      <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(12)}>1 year</Button>
      <Button disabled={currentStage < 3} on:click={() => applyTopUpSuggestion(24)}>2 years</Button>
      <Button disabled={fetchedBalances[selectedToken] === undefined} on:click={applyMaxTopUp}
        >Max</Button
      >
    </div>
  </FormField>
  <svelte:fragment slot="actions">
    <Button
      disabled={!formValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout>

<style>
  .support-type-explainer h4 {
    margin-bottom: 0.5rem;
  }

  .support-type-explainer ul li {
    list-style-type: disc;
    list-style-position: inside;
  }

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

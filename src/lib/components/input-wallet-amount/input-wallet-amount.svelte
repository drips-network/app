<script lang="ts">
  import tokens from '$lib/stores/tokens';
  import unreachable from '$lib/utils/unreachable';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import FormField from '../form-field/form-field.svelte';
  import ListSelect from '../list-select/list-select.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import Toggle from '../toggle/toggle.svelte';
  import { formatUnits } from 'ethers/lib/utils';
  import parseTokenAmount from '$lib/utils/parse-token-amount';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import Token from '../token/token.svelte';

  export let tokenAddress: string | undefined;
  export let tokenBalance: bigint | undefined;
  $: tokenInfo = tokenAddress ? tokens.getByAddress(tokenAddress) ?? unreachable() : unreachable();

  export let inputValue: string;

  export let validationState: TextInputValidationState = {
    type: 'unvalidated',
  };

  export let topUpMax = false;

  $: if (topUpMax) {
    inputValue = formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals);
  }

  export let amount: bigint | undefined = undefined;
  $: {
    if (!tokenInfo?.info || isNaN(Number(inputValue))) {
      throw new Error('Unable to get token info');
    }

    amount = inputValue ? parseTokenAmount(inputValue, tokenInfo.info.decimals) : undefined;

    if (topUpMax && amount && amount > 0n) {
      validationState = { type: 'valid' };
    } else if (amount) {
      if (tokenBalance && amount <= tokenBalance) {
        validationState = { type: 'valid' };
      } else {
        validationState = {
          type: 'invalid',
          message: `You only have ${formatUnits(tokenBalance ?? 0n, tokenInfo.info.decimals)} ${
            tokenInfo.info.symbol
          } in your wallet.`,
        };
      }
    } else if (inputValue && amount === undefined) {
      validationState = { type: 'invalid', message: 'Invalid value.' };
    } else {
      validationState = { type: 'unvalidated' };
    }
  }
</script>

<FormField title="Wallet balance">
  <div class="balance">
    <ListSelect
      blockSelecting
      blockInteraction
      searchable={false}
      items={{
        '': {
          type: 'selectable',
          searchString: [tokenInfo.info.name, tokenInfo.info.symbol],
          label: tokenInfo.info.name ?? 'Unknown token',
          text: `${formatTokenAmount(
            {
              tokenAddress: tokenAddress ?? unreachable(),
              amount: tokenBalance ?? unreachable(),
            },
            tokenInfo.info.decimals,
            1n,
          )} ${tokenInfo.info.symbol}`,
          image: {
            component: Token,
            props: {
              address: tokenAddress,
              show: 'none',
              size: 'small',
            },
          },
        },
      }}
    />
  </div>
</FormField>
<FormField title="Amount">
  <TextInput
    bind:value={inputValue}
    {validationState}
    variant={{ type: 'number', min: 0 }}
    suffix={tokenInfo?.info.symbol}
    disabled={topUpMax}
  />
  <svelte:fragment slot="action">
    <Toggle bind:checked={topUpMax} label="Max" />
  </svelte:fragment>
</FormField>

<style>
  .balance {
    border: 1px solid var(--color-foreground);
    border-radius: 2rem 0 2rem 2rem;
  }
</style>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet/wallet.store';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import assert from '$lib/utils/assert';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import validateUrl from '$lib/utils/validate-url';
  import { isAddress } from 'ethers';
  import { executeErc20ReadMethod } from '$lib/utils/sdk/erc20/erc20';
  import type { OxString } from '$lib/utils/sdk/sdk-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let tokenAddress = '';
  let tokenAddressValidationState: TextInputValidationState = { type: 'unvalidated' };

  let tokenName: string | undefined = undefined;
  let tokenSymbol: string | undefined = undefined;
  let tokenDecimals: number | undefined = undefined;
  let tokenLogoUrl: string | undefined = undefined;

  $: urlValid = tokenLogoUrl ? validateUrl(tokenLogoUrl) : true;

  $: formValid =
    tokenAddressValidationState.type === 'valid' &&
    tokenName &&
    tokenSymbol &&
    tokenDecimals &&
    tokenDecimals > 0 &&
    urlValid;

  async function updateTokenInfo() {
    tokenAddressValidationState = { type: 'pending' };
    try {
      const name = await executeErc20ReadMethod({
        functionName: 'name',
        token: tokenAddress as OxString,
        args: [],
      });

      const symbol = await executeErc20ReadMethod({
        functionName: 'symbol',
        token: tokenAddress as OxString,
        args: [],
      });

      const decimals = await executeErc20ReadMethod({
        functionName: 'decimals',
        token: tokenAddress as OxString,
        args: [],
      });

      tokenName = name;
      tokenSymbol = symbol;
      tokenDecimals = decimals;

      tokenAddressValidationState = { type: 'valid' };
    } catch {
      tokenAddressValidationState = {
        type: 'invalid',
        message: 'Unable to verify ERC-20 token at this address',
      };
    }
  }

  $: {
    if (!tokenAddress || tokenAddress === '') {
      tokenAddressValidationState = { type: 'unvalidated' };
    } else if (isAddress(tokenAddress) && tokens.getByAddress(tokenAddress) !== undefined) {
      tokenAddressValidationState = {
        type: 'invalid',
        message: 'A token with this address is already configured for the current network.',
      };
    } else if (isAddress(tokenAddress)) {
      updateTokenInfo();
    } else {
      tokenAddressValidationState = {
        type: 'invalid',
        message: 'Please enter a valid Ethereum address',
      };
    }
  }

  function submit() {
    assert(tokenAddress && tokenName && tokenDecimals && tokenSymbol);

    tokens.addCustomToken({
      address: tokenAddress,
      name: tokenName,
      decimals: tokenDecimals,
      symbol: tokenSymbol,
      chainId: $wallet.network.chainId,
      logoURI: tokenLogoUrl,
    });

    dispatch('goForward');
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💀"
    headline="Add custom token"
    description="Warning: You’re about to add a token which is not officially-supported by the Drips app. If this token is not fully compliant with the ERC-20 token standard, any deposited tokens may be unrecoverable."
  />
  <FormField title="Token contract address*">
    <TextInput
      placeholder="0x0000"
      bind:value={tokenAddress}
      validationState={tokenAddressValidationState}
    />
  </FormField>
  <FormField title="Token name*">
    <TextInput placeholder="Foocoin" bind:value={tokenName} />
  </FormField>
  <div class="form-row">
    <FormField title="Token symbol*">
      <TextInput placeholder="FOO" bind:value={tokenSymbol} />
    </FormField>
    <FormField title="Decimals*">
      <TextInput placeholder="18" bind:value={tokenDecimals} variant={{ type: 'number', min: 0 }} />
    </FormField>
  </div>
  <FormField title="Token logo URL">
    <TextInput placeholder="https://foo.com/token.png" bind:value={tokenLogoUrl} />
  </FormField>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" disabled={!formValid} on:click={submit}>Add custom token</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .form-row {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
    }
  }
</style>

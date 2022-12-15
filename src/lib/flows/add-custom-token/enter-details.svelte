<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import tokens from '$lib/stores/tokens';
  import wallet from '$lib/stores/wallet';
  import { fetchInfo } from '$lib/utils/erc20';
  import { isAddress } from 'ethers/lib/utils';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import assert from '$lib/utils/assert';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import validateUrl from '$lib/utils/validate-url';

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
      const info = await fetchInfo(tokenAddress, $wallet.provider);

      tokenName = info.name;
      tokenSymbol = info.symbol;
      tokenDecimals = info.decimals;

      tokenAddressValidationState = { type: 'valid' };
    } catch (e) {
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
    description="Warning: You’re about to add a custom, not officially-supported token. Ensure that this token fully and correctly implements the ERC-20 specification. If it doesn’t, you may lose your funds."
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
    <Button on:click={() => dispatch('conclude')}>Cancel</Button>
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

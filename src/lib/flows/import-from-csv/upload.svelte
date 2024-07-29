<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  // import FormField from '$lib/components/form-field/form-field.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  // import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  // import tokens from '$lib/stores/tokens';
  // import wallet from '$lib/stores/wallet/wallet.store';
  // import { fetchInfo } from '$lib/utils/erc20';
  // import { isAddress } from 'ethers/lib/utils';
  // import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  // import TextInput from '$lib/components/text-input/text-input.svelte';
  // import assert from '$lib/utils/assert';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  // import Table from '$lib/components/table/table.svelte';
  import CsvExample from './components/csv-example.svelte';
  import DropZone from './components/drop-zone.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowDown from '$lib/components/icons/ArrowDown.svelte';
  // import validateUrl from '$lib/utils/validate-url';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  // export let tokenAddress = '';
  // let tokenAddressValidationState: TextInputValidationState = { type: 'unvalidated' };

  // let tokenName: string | undefined = undefined;
  // let tokenSymbol: string | undefined = undefined;
  // let tokenDecimals: number | undefined = undefined;
  // let tokenLogoUrl: string | undefined = undefined;

  // $: urlValid = tokenLogoUrl ? validateUrl(tokenLogoUrl) : true;

  let file: File | undefined = undefined;

  $: formValid = !!file;
  // $: formValid =
  //   tokenAddressValidationState.type === 'valid' &&
  //   tokenName &&
  //   tokenSymbol &&
  //   tokenDecimals &&
  //   tokenDecimals > 0 &&
  //   urlValid;

  // async function updateTokenInfo() {
  //   tokenAddressValidationState = { type: 'pending' };
  //   try {
  //     const info = await fetchInfo(tokenAddress, $wallet.provider);

  //     tokenName = info.name;
  //     tokenSymbol = info.symbol;
  //     tokenDecimals = info.decimals;

  //     tokenAddressValidationState = { type: 'valid' };
  //   } catch {
  //     tokenAddressValidationState = {
  //       type: 'invalid',
  //       message: 'Unable to verify ERC-20 token at this address',
  //     };
  //   }
  // }

  // $: {
  //   if (!tokenAddress || tokenAddress === '') {
  //     tokenAddressValidationState = { type: 'unvalidated' };
  //   } else if (isAddress(tokenAddress) && tokens.getByAddress(tokenAddress) !== undefined) {
  //     tokenAddressValidationState = {
  //       type: 'invalid',
  //       message: 'A token with this address is already configured for the current network.',
  //     };
  //   } else if (isAddress(tokenAddress)) {
  //     updateTokenInfo();
  //   } else {
  //     tokenAddressValidationState = {
  //       type: 'invalid',
  //       message: 'Please enter a valid Ethereum address',
  //     };
  //   }
  // }

  function handleDropZoneInput({ file: dropZoneFile }: { file: File }) {
    file = dropZoneFile;
  }

  function submit() {
    // assert(tokenAddress && tokenName && tokenDecimals && tokenSymbol);

    // tokens.addCustomToken({
    //   address: tokenAddress,
    //   name: tokenName,
    //   decimals: tokenDecimals,
    //   symbol: tokenSymbol,
    //   chainId: $wallet.network.chainId,
    //   logoURI: tokenLogoUrl,
    // });

    dispatch('goForward');
  }

  function handleImport() {}
</script>

<StepLayout>
  <StepHeader
    headline="Import recipients from CSV"
    description="Your CSV file should simply be formatted by first listing the recipient, then listing the percentage allocation. For example:"
  ></StepHeader>
  <CsvExample />
  <form on:submit|preventDefault={handleImport}>
    <DropZone
      on:input={(event) => handleDropZoneInput({ file: event.detail.file })}
      filetypes={['text/csv']}
      instructions="Drop a CSV here to upload"
    />
  </form>
  <!-- <FormField title="Token contract address*">
    <TextInput
      placeholder="0x0000"
      bind:value={tokenAddress}
      validationState={tokenAddressValidationState}
    />
  </FormField> -->
  <!-- <FormField title="Token name*">
    <TextInput placeholder="Foocoin" bind:value={tokenName} />
  </FormField> -->
  <!-- <div class="form-row">
    <FormField title="Token symbol*">
      <TextInput placeholder="FOO" bind:value={tokenSymbol} />
    </FormField>
    <FormField title="Decimals*">
      <TextInput placeholder="18" bind:value={tokenDecimals} variant={{ type: 'number', min: 0 }} />
    </FormField>
  </div>
  <FormField title="Token logo URL">
    <TextInput placeholder="https://foo.com/token.png" bind:value={tokenLogoUrl} />
  </FormField> -->
  <svelte:fragment slot="left-actions">
    <Button variant="ghost" icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button icon={ArrowDown} variant="primary" disabled={!formValid} on:click={submit}
      >Import</Button
    >
  </svelte:fragment>
</StepLayout>

<!-- <StandaloneFlowStepLayout
  headline="Create a Drip List"
  description="What projects, individuals, organizations, or other Drip Lists would you like to support with your Drip List?"
>
  <FormField title="Recipients*">
    <ListEditor
      bind:weights={$context.dripList.weights}
      bind:items={$context.dripList.items}
      bind:valid={listValid}
      addOnMount={urlToAdd}
    >
    <svelte:fragment slot="triggers">
      <button class="flex typo-text" on:click={handleImportCSV}>
        <ArrowDown style="fill: var(--color-foreground)" />
        Import from CSV
      </button>
    </svelte:fragment>
    </ListEditor>
  </FormField>
  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Button
      disabled={!listValid}
      icon={Check}
      variant="primary"
      on:click={() => dispatch('goForward')}>Continue</Button
    >
  </svelte:fragment>
</StandaloneFlowStepLayout> -->

<style>
  /* .form-row {
    display: flex;
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .form-row {
      flex-direction: column;
    }
  } */
</style>

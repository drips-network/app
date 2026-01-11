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
  import wallet from '$lib/stores/wallet/wallet.store';
  import network from '$lib/stores/wallet/network';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';
  import assert from '$lib/utils/assert';
  import Plus from '$lib/components/icons/Plus.svelte';
  import addCustomTokenFlowSteps from '../add-custom-token/add-custom-token-flow-steps';
  import { getAddressDriverAllowance } from '$lib/utils/sdk/address-driver/address-driver';
  import type { OxString } from '$lib/utils/sdk/sdk-types';
  import { executeErc20ReadMethod } from '$lib/utils/sdk/erc20/erc20';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    context: Writable<TopUpFlowState>;
  }

  let { context }: Props = $props();

  const autoWrapOptions = $derived(
    (network.autoUnwrapPairs ?? []).flatMap((pair) => {
      const wrappedToken = tokens.getByAddress(pair.wrappedTokenAddress);

      if (!wrappedToken) return [];

      return [
        {
          slug: `native-${pair.wrappedTokenAddress}`,
          pair,
          wrappedToken,
        },
      ];
    }),
  );

  let tokenList: Items = $derived({
    ...Object.fromEntries(
      autoWrapOptions.map((option) => [
        option.slug,
        {
          type: 'selectable',
          searchString: [option.pair.name, option.pair.nativeSymbol, option.pair.wrappedSymbol],
          label: `${option.pair.nativeSymbol} (auto-wrap)`,
          text: `Will wrap to ${option.pair.wrappedSymbol}`,
          image: {
            component: Token,
            props: {
              show: 'none',
              address: option.wrappedToken.info.address,
              size: 'small',
            },
          },
        },
      ]),
    ),
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
    'add-custom-token': {
      type: 'action',
      label: 'Add custom token',
      handler: () =>
        dispatch('sidestep', {
          steps: addCustomTokenFlowSteps().steps,
        }),
      image: {
        component: Plus,
        props: {},
      },
    },
  });

  let selected: string[] = $state([]);
  const selectedAutoWrap = $derived(autoWrapOptions.find((option) => option.slug === selected[0]));
  const effectiveTokenAddress = $derived(
    selectedAutoWrap ? selectedAutoWrap.pair.wrappedTokenAddress : selected[0],
  );
  let selectedToken = $derived(
    effectiveTokenAddress ? tokens.getByAddress(effectiveTokenAddress) : undefined,
  );

  async function updateContext() {
    const tokenAddress = effectiveTokenAddress;

    const { address } = $wallet;
    assert(address && tokenAddress);

    const allowance = await getAddressDriverAllowance(tokenAddress as OxString);
    const balance = selectedAutoWrap
      ? await $wallet.provider.getBalance(address)
      : await executeErc20ReadMethod({
          functionName: 'balanceOf',
          token: tokenAddress as OxString,
          args: [address as OxString],
        });

    context.update((c) => ({
      ...c,
      tokenAddress,
      tokenAllowance: allowance,
      tokenBalance: balance,
      autoWrap: Boolean(selectedAutoWrap),
      autoWrapPair: selectedAutoWrap?.pair,
    }));
  }

  function submit() {
    dispatch('await', {
      message: `Fetching your ${selectedToken?.info.name ?? ''} balance...`,
      promise: () => updateContext(),
    });
  }
</script>

<StepLayout>
  <StepHeader
    emoji="💸"
    headline="Add funds"
    description="Add any ERC-20 token to your Drips account in order to start streaming."
  />
  <FormField title="Select token">
    <div class="list-container">
      <ListSelect bind:selected items={tokenList} type="tokens" />
    </div>
  </FormField>
  {#snippet actions()}
    <Button onclick={() => dispatch('conclude')} variant="ghost">Cancel</Button>
    <Button variant="primary" disabled={selected.length !== 1} onclick={submit}
      >Add {selectedToken?.info.name ?? ''}</Button
    >
  {/snippet}
</StepLayout>

<style>
  .list-container {
    height: 24rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    overflow: auto;
  }
</style>

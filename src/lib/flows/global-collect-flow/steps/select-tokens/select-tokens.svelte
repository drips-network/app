<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Token from '$lib/components/token/token.svelte';
  import modal from '$lib/stores/modal';
  import tokensStore from '$lib/stores/tokens/tokens.store';
  import formatTokenAmount from '$lib/utils/format-token-amount';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import batchCollect from '../../batch-collect';
  import { createEventDispatcher } from 'svelte';
  import formatDate from '$lib/utils/format-date';
  import InfoCircle from '$lib/components/icons/InfoCircle.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import AddCustomTokenButton from './components/add-custom-token-button.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher();

  interface Amount {
    tokenAddress: string;
    amount: bigint;
  }

  export let splittable: {
    tokenAddress: string;
    amount: bigint;
  }[];

  function getListItemDescription(amount: Amount) {
    const token = tokensStore.getByAddress(amount.tokenAddress);

    return token
      ? `${formatTokenAmount(amount.amount, token.info.decimals, 1n, false)} ${token.info.symbol}`
      : '';
  }

  $: selectorItems =
    $tokensStore &&
    Object.fromEntries(
      mapFilterUndefined(splittable ?? [], (s) => {
        const unknownToken = tokensStore.getByAddress(s.tokenAddress) === undefined;

        return [
          s.tokenAddress,
          {
            type: 'selectable' as const,
            text: unknownToken
              ? {
                  component: AddCustomTokenButton,
                  props: {
                    dispatch,
                    tokenAddress: s.tokenAddress,
                  },
                }
              : getListItemDescription(s),
            label: {
              component: Token,
              props: {
                address: s.tokenAddress,
              },
            },
          },
        ];
      }),
    );

  $: canCollect = Object.values(selectorItems ?? {}).length > 0;

  $: shouldAutoUnwrap = shouldShowAutoUnwrapToggle;

  $: shouldShowAutoUnwrapToggle = splittable.some((s) => {
    // Not all chains have the unwrapping helper contract deployed
    if (!network.contracts.NATIVE_TOKEN_UNWRAPPER) return false;

    const token = tokensStore.getByAddress(s.tokenAddress);

    return network.autoUnwrapPairs?.find(
      (p) => p.nativeSymbol === token?.info.symbol || p.wrappedSymbol === token?.info.symbol,
    );
  });

  let selected =
    mapFilterUndefined(splittable, (s) => {
      const unknownToken = tokensStore.getByAddress(s.tokenAddress) === undefined;

      return unknownToken ? undefined : s.tokenAddress;
    }) ?? [];

  function submit() {
    batchCollect(selected, dispatch, shouldAutoUnwrap);
  }
</script>

<StepLayout>
  <StepHeader
    emoji="🫗"
    headline="Collect funds"
    description={canCollect
      ? 'Choose which tokens you’d like to collect.'
      : "You don't have any funds to collect this period."}
  />
  {#if canCollect && selectorItems}
    <div class="list-container">
      <ListSelect
        bind:selected
        emptyStateText="No tokens to collect"
        searchable={false}
        multiselect={true}
        items={selectorItems}
      />
    </div>
  {/if}
  <div class="next-settlement">
    <div class="left">
      <p>Next settlement</p>
      <Tooltip>
        <InfoCircle />
        <svelte:fragment slot="tooltip-content">
          <p>
            {network.settlement.explainerText}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.drips.network/claim-your-repository#settlement-of-future-funds"
              class="learn-more">Learn more</a
            >
          </p>
        </svelte:fragment>
      </Tooltip>
    </div>
    <p class="typo-text-bold">
      {#if network.settlement.nextSettlementDate === 'daily'}
        Daily
      {:else}
        {formatDate(network.settlement.nextSettlementDate(), 'onlyDay')}
      {/if}
    </p>
  </div>
  {#if shouldShowAutoUnwrapToggle}
    <div class="unwrap-toggle">
      <Toggle bind:checked={shouldAutoUnwrap} />
      <div class="unwrap-description">
        <p>Unwrap supported tokens upon collection</p>
        <p>For example WETH -> ETH</p>
      </div>
    </div>
  {/if}
  <svelte:fragment slot="actions">
    {#if canCollect}
      <Button on:click={modal.hide} variant="ghost">Never mind</Button>
      <Button on:click={submit} icon={Wallet} disabled={selected.length === 0} variant="primary"
        >Confirm in wallet</Button
      >
    {:else}
      <Button on:click={modal.hide}>Close</Button>
    {/if}
  </svelte:fragment>
</StepLayout>

<style>
  .list-container {
    min-height: 3.5rem;
    max-height: 14rem;
    border-radius: 1rem 0 1rem 1rem;
    overflow: scroll;
    box-shadow: var(--elevation-low);
  }

  .next-settlement {
    display: flex;
    justify-content: space-between;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground);
    padding: 1rem;
  }

  .next-settlement .left {
    display: flex;
    gap: 0.25rem;
  }

  .learn-more {
    color: var(--color-foreground-level-6);
    text-decoration: underline;
  }

  .unwrap-toggle {
    display: flex;
    align-items: center;
  }

  .unwrap-description {
    display: flex;
    align-items: baseline;
    flex-direction: column;
    margin-left: 1rem;
    gap: 0.25rem;
  }

  .unwrap-description p {
    line-height: 22px;
  }

  .unwrap-description p:last-child {
    color: var(--color-foreground-level-5);
  }
</style>

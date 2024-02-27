<script lang="ts">
  import DeviceIcon from '$lib/components/icons/Device.svelte';
  import Section from '../section/section.svelte';
  import developerModeStore from '$lib/stores/developer-mode/developer-mode.store';
  import Copyable from '../copyable/copyable.svelte';
  import Coin from '$lib/components/icons/Coin.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import Box from '$lib/components/icons/Box.svelte';
  import { Utils } from 'radicle-drips';
  import Splits from '$lib/components/icons/Splits.svelte';

  export let accountId: string | undefined = undefined;

  const DRIVER_FRIENDLY_NAMES = {
    nft: 'NFT Driver',
    address: 'Address Driver',
    repo: 'Repo Driver',
    immutableSplits: 'Immutable Splits Driver',
  } as const;

  const DRIVER_ICONS = {
    nft: Coin,
    address: Wallet,
    repo: Box,
    immutableSplits: Splits,
  } as const;

  $: driver = accountId && Utils.AccountId.getDriver(accountId);
</script>

{#if $developerModeStore}
  <Section
    collapsable
    header={{
      label: 'Developer',
      icon: DeviceIcon,
    }}
    skeleton={{
      loaded: Boolean(accountId),
    }}
  >
    <div class="values typo-text tabular-nums">
      {#if accountId}
        <div class="key-value">
          <h5 class="key">Account ID</h5>
          <Copyable value={accountId} alwaysVisible>
            <span class="value">{accountId}</span>
          </Copyable>
        </div>
      {/if}

      {#if driver}
        <div class="key-value">
          <h5 class="key">Driver</h5>
          <div class="value">
            <svelte:component this={DRIVER_ICONS[driver]} />
            {DRIVER_FRIENDLY_NAMES[driver]}
          </div>
        </div>
      {/if}
    </div>
  </Section>
{/if}

<style>
  .values {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .key-value {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: fit-content;
  }

  .key-value .key {
    color: var(--color-foreground-level-6);
  }

  .key-value .value {
    width: fit-content;
    display: inline-flex;
    gap: 0.25rem;
  }
</style>

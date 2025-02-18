<script lang="ts">
  import DeviceIcon from '$lib/components/icons/Device.svelte';
  import Section from '../section/section.svelte';
  import developerModeStore from '$lib/stores/developer-mode/developer-mode.store';
  import Copyable from '../copyable/copyable.svelte';
  import contractConstants from '$lib/utils/sdk/utils/contract-constants';
  import CodeBox from '../code-box/code-box.svelte';

  export let amtPerSec: bigint | undefined = undefined;
  export let tokenAddress: string | undefined = undefined;
  export let tokenDecimals: number | undefined = undefined;
  export let startDate: Date | undefined = undefined;
  export let createdAt: Date | undefined = undefined;
  export let rawTimeline: string | undefined = undefined;
</script>

{#if $developerModeStore}
  <Section
    collapsable
    header={{
      label: 'Developer',
      icon: DeviceIcon,
    }}
    skeleton={{
      loaded: Boolean(amtPerSec && tokenAddress && tokenDecimals),
    }}
  >
    <div class="values typo-text tabular-nums">
      {#if tokenAddress}
        <div class="key-value">
          <h5 class="key">Token Address</h5>
          <Copyable value={tokenAddress} alwaysVisible>
            <span class="value">{tokenAddress}</span>
          </Copyable>
        </div>
      {/if}

      {#if tokenDecimals}
        <div class="key-value">
          <h5 class="key">Token Decimals</h5>
          <Copyable value={tokenDecimals.toString()} alwaysVisible>
            <span class="value">{tokenDecimals}</span>
          </Copyable>
        </div>
      {/if}

      {#if amtPerSec}
        {@const amtPerSecondWei = String(
          amtPerSec / BigInt(contractConstants.AMT_PER_SEC_MULTIPLIER),
        )}
        <div class="key-value">
          <h5 class="key">Amount per sec (with extra precision)</h5>
          <Copyable value={amtPerSec.toString()} alwaysVisible>
            <span class="value">{amtPerSec}</span>
          </Copyable>
        </div>

        <div class="key-value">
          <h5 class="key">Amount per sec (at token precision)</h5>
          <Copyable value={amtPerSecondWei} alwaysVisible>
            <span class="value">{amtPerSecondWei}</span>
          </Copyable>
        </div>
      {/if}

      {#if createdAt}
        <div class="key-value">
          <h5 class="key">Created at (unix)</h5>
          <Copyable value={String(createdAt.getTime() / 1000)} alwaysVisible>
            <span class="value">{createdAt.getTime() / 1000}</span>
          </Copyable>
        </div>
      {/if}

      {#if startDate}
        <div class="key-value">
          <h5 class="key">Start date (unix)</h5>
          <Copyable value={String(startDate.getTime() / 1000)} alwaysVisible>
            <span class="value">{startDate.getTime() / 1000}</span>
          </Copyable>
        </div>
      {/if}

      {#if rawTimeline}
        <div class="key-value">
          <h5 class="key">Raw stream timeline</h5>
          <CodeBox code={rawTimeline} />
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

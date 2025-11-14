<script module lang="ts">
  export interface AddressCellProps {
    address: string;
  }
</script>

<script lang="ts">
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import formatAddress from '$lib/utils/format-address';

  interface Props {
    address: string;
  }

  let { address }: Props = $props();

  let formatted = $derived(formatAddress(address));
</script>

<span class="typo-text tabular-nums">
  <Tooltip text={address} copyable>
    {formatted}
    {#snippet tooltip_content()}
      <span class="typo-text tabular-nums">{address}</span>
    {/snippet}
  </Tooltip>
</span>

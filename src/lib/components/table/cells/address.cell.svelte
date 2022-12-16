<script context="module" lang="ts">
  export interface AddressCellProps {
    address: string;
  }
</script>

<script lang="ts">
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';
  import formatAddress from '$lib/utils/format-address';

  export let address: string;

  $: formatted = formatAddress(address);
</script>

<span class="typo-text-mono">
  <Tooltip text={address} copyable>
    {formatted}
  </Tooltip>
</span>

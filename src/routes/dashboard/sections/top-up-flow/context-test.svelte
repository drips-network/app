<script lang="ts">
  import type { Writable } from 'svelte/store';
  import type { TopUpFlowState } from './top-up-flow-state';

  export let context: Writable<TopUpFlowState>;
</script>

{$context.tokenAddress}
{$context.tokenAllowance?.toString()}

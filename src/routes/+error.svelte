<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';

  let description: string;
  $: {
    switch ($page.status) {
      case 404: {
        description = "We weren't able to find that page.";
        break;
      }
      case 500: {
        description = 'Something went wrong on our end.';
        break;
      }
      default: {
        description = 'Something went wrong.';
      }
    }
  }
</script>

<LargeEmptyState
  emoji="💀"
  headline="Error {$page.status}"
  {description}
  button={{
    label: 'Go back home',
    handler: () => goto('/'),
  }}
/>

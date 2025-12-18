<script lang="ts">
  import { page } from '$app/state';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
  import Card from '$lib/components/wave/card/card.svelte';

  let description = $derived.by(() => {
    switch (page.status) {
      case 404: {
        return "We weren't able to find this.";
      }
      case 500: {
        return 'Something went wrong on our end.';
      }
      default: {
        return page.error?.message || 'Something went wrong.';
      }
    }
  });
</script>

<Card>
  <LargeEmptyState emoji="💀" headline="Error {page.status}" {description} />
</Card>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';

  let description: string;
  $: {
    switch ($page.status) {
      case 404: {
        description = 'We werenʼt able to find this round draft. You may have to authenticate first.';
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

  $: displayAuthButton = $page.status === 404;
</script>

<LargeEmptyState
  emoji="💀"
  headline="Error {$page.status}"
  {description}
  showSiweButton={displayAuthButton}
  button={{
    label: 'Go back',
    handler: () => goto('/app/rpgf'),
  }}
/>

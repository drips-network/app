<script lang="ts">
  import { run } from 'svelte/legacy';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';

  let description: string | undefined = $state();
  run(() => {
    switch ($page.status) {
      case 404: {
        description =
          'We werenʼt able to find this. You may have to sign in with your wallet first.';
        break;
      }
      case 401: {
        description =
          'You are not authorized to view this. You may have to sign in with your wallet first.';
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
  });
</script>

<LargeEmptyState
  emoji="💀"
  headline="Error {$page.status}"
  {description}
  showSiweButton={$page.status === 401}
  button={{
    label: 'Go back',
    handler: () => goto('/app/rpgf'),
  }}
/>

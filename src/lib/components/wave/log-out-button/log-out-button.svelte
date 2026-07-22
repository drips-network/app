<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import cupertinoPaneStore from '$lib/stores/cupertino-pane/cupertino-pane.store';
  import { logOut } from '$lib/utils/wave/auth';

  let loggingOut = $state(false);

  async function handleLogOut() {
    loggingOut = true;
    await logOut();
    await invalidateAll();
    loggingOut = false;
    cupertinoPaneStore.closeSheet();
  }
</script>

<Button onclick={handleLogOut} loading={loggingOut}>Log out</Button>

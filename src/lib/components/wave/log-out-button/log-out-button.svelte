<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import { logOut } from '$lib/utils/wave/auth';

  let loggingOut = $state(false);

  async function handleLogOut() {
    loggingOut = true;
    await logOut();
    await invalidateAll();
    loggingOut = false;
  }
</script>

<Button onclick={handleLogOut} loading={loggingOut}>Log out</Button>

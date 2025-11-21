<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

{#if data.user}
  <h1>Welcome, {data.user.name}!</h1>

  {JSON.stringify(data.user)}
{:else}
  <h1>You are not logged in.</h1>
{/if}

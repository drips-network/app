<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';

  let { data } = $props();

  let refreshing = $state(false);

  async function handleRefresh() {
    refreshing = true;
    await invalidate('wave:maintainer-onboarding-review-repos');
    refreshing = false;
  }
</script>

<h1>Review orgs & repos</h1>

<p>
  orgs: {data.userOrgs.data.map((uo) => uo.org.gitHubOrgLogin).join(', ')}
</p>

<p>
  repos: {data.ownRepos.data.map((r) => r.gitHubRepoName).join(', ')}
</p>

<br />

<Button onclick={handleRefresh} disabled={refreshing}>Refresh</Button>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public.js';

  const WAVE_GITHUB_APP_NAME = getOptionalEnvVar(
    'PUBLIC_WAVE_GITHUB_APP_NAME',
    true,
    'Links to install the Wave app wont work',
  );

  let { data } = $props();
</script>

<h1>Install the Wave GitHub App</h1>

{#if data.userOrgs.data.length > 0}
  existing orgs: {data.userOrgs.data.map((uo) => uo.org.gitHubOrgLogin).join(', ')}
{/if}

<br />

<Button href="https://github.com/apps/{WAVE_GITHUB_APP_NAME}/installations/new">
  Install the {WAVE_GITHUB_APP_NAME} GitHub App
</Button>

<Button
  variant="primary"
  href="/wave/maintainer-onboarding/review-repos"
  disabled={data.userOrgs.data.length === 0}>Continue to review repos</Button
>

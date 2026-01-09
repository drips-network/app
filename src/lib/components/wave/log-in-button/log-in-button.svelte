<script lang="ts">
  import { page } from '$app/state';
  import Button from '$lib/components/button/button.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

  let {
    backTo = page.url.pathname + page.url.search,
    wordy = false,
    primary = false,
    skipWelcome = false,
  }: { backTo?: string; wordy?: boolean; primary?: boolean; skipWelcome?: boolean } = $props();

  const WAVE_API_URL = getOptionalEnvVar(
    'PUBLIC_WAVE_API_URL',
    true,
    'Wave functionality will not work.',
  );
</script>

<Button
  icon={Github}
  variant={primary ? 'primary' : undefined}
  href="{WAVE_API_URL}/api/auth/oauth/github/login{backTo
    ? `?backTo=${encodeURIComponent(backTo)}&skipWelcome=${skipWelcome}`
    : ''}">{wordy ? 'Log in with GitHub' : 'Log in'}</Button
>

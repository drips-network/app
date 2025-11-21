<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';

  const WAVE_API_URL = getOptionalEnvVar(
    'PUBLIC_WAVE_API_URL',
    true,
    'Wave functionality will not work.',
  );
</script>

<Button href="{WAVE_API_URL}/api/auth/oauth/github/login">Log in with GitHub</Button>

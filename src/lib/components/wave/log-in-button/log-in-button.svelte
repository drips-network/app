<script lang="ts">
  import { page } from '$app/state';
  import Button from '$lib/components/button/button.svelte';
  import Github from '$lib/components/icons/Github.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public';
  import { PRIVACY_POLICY_VERSION, WAVE_TERMS_VERSION } from '$lib/utils/wave/legal-versions';

  let {
    backTo = page.url.pathname + page.url.search,
    wordy = false,
    primary = false,
    skipWelcome = false,
    disabled = false,
  }: {
    backTo?: string;
    wordy?: boolean;
    primary?: boolean;
    skipWelcome?: boolean;
    disabled?: boolean;
  } = $props();

  const WAVE_API_URL = getOptionalEnvVar(
    'PUBLIC_WAVE_API_URL',
    true,
    'Wave functionality will not work.',
  );

  /**
   * Attribution ref param from the URL, if any
   * These are created by admins and used to track signups from specific
   * campaigns / communities etc.
   */
  let attributionRefParam = page.url.searchParams.get('ref');

  /**
   * Build the GitHub OAuth login URL with all the query params the wave
   * backend round-trips through the OAuth `state` cookie. `termsVersion` and
   * `privacyVersion` are required by the backend — they pin the consent
   * record we write at login time to the exact document versions the user
   * saw on screen.
   */
  function buildLoginHref(): string {
    const parts: string[] = [
      `termsVersion=${encodeURIComponent(WAVE_TERMS_VERSION)}`,
      `privacyVersion=${encodeURIComponent(PRIVACY_POLICY_VERSION)}`,
    ];

    if (backTo) {
      parts.push(`backTo=${encodeURIComponent(backTo)}`, `skipWelcome=${skipWelcome}`);
    }

    if (attributionRefParam) {
      parts.push(`ref=${encodeURIComponent(attributionRefParam)}`);
    }

    return `${WAVE_API_URL}/api/auth/oauth/github/login?${parts.join('&')}`;
  }
</script>

<Button icon={Github} {disabled} variant={primary ? 'primary' : undefined} href={buildLoginHref()}
  >{wordy ? 'Log in with GitHub' : 'Log in'}</Button
>

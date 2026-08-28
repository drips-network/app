<script lang="ts">
  import LargeEmptyState from '$lib/components/large-empty-state/large-empty-state.svelte';
</script>

<LargeEmptyState
  emoji="📭"
  headline="Verify your email on GitHub"
  description="Your GitHub account's primary email address isn't verified, which is required for using Wave. Verify it on GitHub, then sign in again."
  learnMoreLink={{
    label: 'How to verify your email address on GitHub',
    url: 'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/verifying-your-email-address',
  }}
  button={{
    label: 'Sign in again',
    handler: () => {
      window.location.href = '/wave/login';
    },
  }}
/>

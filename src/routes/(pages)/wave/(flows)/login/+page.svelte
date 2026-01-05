<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import LogInButton from '$lib/components/wave/log-in-button/log-in-button.svelte';

  let { data } = $props();
</script>

<HeadMeta title="Sign In | Wave" />

<h1>Sign in to Drips Wave</h1>
<p>To start using Drips Wave, please sign in with your GitHub account.</p>

<LogInButton primary wordy backTo={data.backTo || '/wave'} skipWelcome={data.skipWelcome} />

<p class="typo-text-small" style:margin-top="1.5rem" style:color="var(--color-foreground-level-6)">
  By logging into Drips Wave, you agree to the <a
    class="typo-link"
    target="_blank"
    href="https://docs.drips.network/wave/terms-and-rules">Terms of Service</a
  >
  and <a class="typo-link" target="_blank" href="/legal/privacy">Privacy Policy</a>.
</p>

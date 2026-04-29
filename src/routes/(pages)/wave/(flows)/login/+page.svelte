<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Checkbox from '$lib/components/checkbox/checkbox.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import LogInButton from '$lib/components/wave/log-in-button/log-in-button.svelte';

  let { data } = $props();

  let confirmed = $state(false);
</script>

<HeadMeta title="Sign In | Wave" />

<h1>Sign in to Drips Wave</h1>
<p>To start using Drips Wave, please sign in with your GitHub account.</p>

<div class="confirm-box">
  <AnnotationBox type="warning" hideIcon>
    <label class="confirm">
      <Checkbox bind:checked={confirmed} />
      <span class="typo-text-small">
        I confirm that <span class="typo-text-small-bold">I am at least 18 years of age</span> and
        agree to the
        <a class="typo-link" target="_blank" href="https://docs.drips.network/wave/terms-and-rules"
          >Drips Wave Terms &amp; Rules</a
        >.
      </span>
    </label>
  </AnnotationBox>
</div>

<LogInButton
  primary
  wordy
  disabled={!confirmed}
  backTo={data.backTo || '/wave'}
  skipWelcome={data.skipWelcome}
/>

<p class="typo-text-small" style:max-width="32rem" style:color="var(--color-foreground-level-6)">
  By logging in, you acknowledge our
  <a class="typo-link" target="_blank" href="/legal/privacy">Privacy Policy</a>.
</p>

<style>
  .confirm-box {
    max-width: 28rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .confirm {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: left;
    cursor: pointer;
  }
</style>

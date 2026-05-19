<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Section from '$lib/components/section/section.svelte';
  import Button from '$lib/components/button/button.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import GrantDetail from '$lib/components/wave/rewards/grant-detail.svelte';
  import {
    logoutMagicLinkSession,
    magicLinkSessionGrantActionContext,
  } from '$lib/utils/wave/grants/action-context';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';

  let { data } = $props();

  let state = $derived(data.state);

  let actionContext = magicLinkSessionGrantActionContext();

  async function refresh() {
    await invalidate('wave:magic-link-session');
  }

  async function endSession() {
    await doWithErrorModal(async () => {
      await logoutMagicLinkSession();
      await goto('/wave', { replaceState: true });
    });
  }
</script>

<svelte:head>
  <meta name="referrer" content="no-referrer" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<HeadMeta title="Withdraw grant" />

<div class="page">
  <header class="header">
    <h1 class="typo-header-3">Withdraw your grant</h1>
    {#if state.state === 'active'}
      <Button variant="normal" size="small" onclick={endSession}>End session</Button>
    {/if}
  </header>

  {#if state.state === 'active' && state.grant}
    <AnnotationBox type="info">
      You are using a one-time withdrawal link issued by a Drips admin. This session does not
      require a GitHub login. When you're done, click "End session" above.
    </AnnotationBox>

    <GrantDetail
      grant={state.grant}
      {actionContext}
      kycStatus={{ reviewAnswer: 'GREEN' }}
      hideIdentityLinks
    />
  {:else if state.state === 'grant_complete'}
    <div class="centered">
      <Section header={{ label: 'Grant fully withdrawn' }} skeleton={{ loaded: true }}>
        <p class="typo-text">
          This grant has already been fully withdrawn. There is nothing left to do.
        </p>
      </Section>
    </div>
  {:else if state.state === 'expired'}
    <div class="centered">
      <Section header={{ label: 'Link expired' }} skeleton={{ loaded: true }}>
        <p class="typo-text">
          The withdrawal link has expired. Please contact the admin who issued it to get a fresh
          link.
        </p>
      </Section>
    </div>
  {:else}
    <div class="centered">
      <Section header={{ label: 'Session not active' }} skeleton={{ loaded: true }}>
        <p class="typo-text">
          The withdrawal session is not active. The link may have been revoked, or your session may
          have timed out due to inactivity. Re-open the original link from the message the admin
          sent you, or ask them to issue a new one.
        </p>
        <div class="actions">
          <Button variant="normal" onclick={refresh}>Reload</Button>
        </div>
      </Section>
    </div>
  {/if}
</div>

<style>
  .page {
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .centered {
    max-width: 32rem;
    margin: 4rem auto;
    width: 100%;
  }

  .actions {
    margin-top: 1rem;
  }
</style>

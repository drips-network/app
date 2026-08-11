<script lang="ts">
  import { onMount } from 'svelte';
  import performLogin, { LoginRestartRequiredError } from './perform-login';
  import { page } from '$app/state';
  import { goto, invalidateAll } from '$app/navigation';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import Button from '$lib/components/button/button.svelte';
  import { AccountSuspendedError } from '$lib/utils/wave/call';
  import { getKycStatus } from '$lib/utils/wave/kyc';
  import { isHttpError } from '@sveltejs/kit';

  let { data } = $props();
  let { backTo, skipWelcome } = $derived(data);

  let error = $state<boolean>(false);
  let errorMessage = $state<string | null>(null);

  let loginHref = $derived(`/wave/login${backTo ? `?backTo=${encodeURIComponent(backTo)}` : ''}`);

  // If backTo already points at /wave/kyc-required (e.g. the user was bounced
  // through login from that page), unwrap the inner backTo so we don't nest
  // kyc-required inside itself. Loop with a small cap as defense against
  // pathological deep nesting left over from earlier bugs.
  function unwrapKycRequiredBackTo(rawBackTo: string): string {
    let current = rawBackTo;
    for (let i = 0; i < 5 && current.startsWith('/wave/kyc-required'); i++) {
      try {
        const u = new URL(current, page.url.origin);
        current = u.searchParams.get('backTo') || '/wave';
      } catch {
        return '/wave';
      }
    }
    return current;
  }

  onMount(async () => {
    try {
      const { newUser: isNewUser } = await performLogin(page.url);
      await invalidateAll();

      // KYC status is best-effort during login — if the call fails, skip the
      // kyc-required nudge rather than breaking the entire login flow.
      let kycStatus: Awaited<ReturnType<typeof getKycStatus>> | undefined;
      try {
        kycStatus = await getKycStatus();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch KYC status during login callback:', err);
      }

      if (kycStatus) {
        const isKycVerified =
          kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN';
        const isKycRejected = kycStatus.reviewAnswer === 'RED';

        // Only nudge users who haven't been through verification yet. If KYC was
        // rejected, the "please verify your identity" pitch is misleading — they
        // already tried.
        if (!isKycVerified && !isKycRejected) {
          const target = unwrapKycRequiredBackTo(backTo || '');
          const kycRequiredBackTo = `/wave/kyc-required?backTo=${encodeURIComponent(target)}`;
          if (isNewUser && !skipWelcome) {
            return goto(`/wave/welcome?backTo=${encodeURIComponent(kycRequiredBackTo)}`);
          }
          return goto(kycRequiredBackTo);
        }
      }

      if (isNewUser && !skipWelcome) {
        return goto(`/wave/welcome?backTo=${encodeURIComponent(backTo || '')}`);
      }

      return goto(backTo || '/wave');
    } catch (err) {
      if (err instanceof AccountSuspendedError) {
        return goto('/wave/suspended');
      }

      // This code was already redeemed by an earlier load of this page (e.g.
      // a reload mid-exchange). If that attempt actually established a
      // session, the login page bounces straight to backTo; otherwise it's a
      // single tap to restart, which GitHub re-authorizes instantly.
      if (err instanceof LoginRestartRequiredError) {
        return goto(loginHref);
      }

      // eslint-disable-next-line no-console
      console.error('Login callback error:', isHttpError(err) ? err.body : err);
      errorMessage = isHttpError(err) ? err.body.message : null;
      error = true;
    }
  });
</script>

<div
  class="typo-text"
  style:display="flex"
  style:flex-direction="column"
  style:align-items="center"
  style:gap="1rem"
>
  {#if error}
    <div class="typo-heading-3" style:text-align="center" style:color="var(--color-error)">
      {#if errorMessage}
        {errorMessage} If this problem persists, contact us at support@drips.network.
      {:else}
        Something went wrong. Please try again, and if this problem persists, contact us at
        support@drips.network.
      {/if}
    </div>

    <Button href={loginHref}>Try again</Button>
  {:else}
    <Spinner />
    One moment please, you're being logged in...
  {/if}
</div>

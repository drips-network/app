<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import CrossCircle from '$lib/components/icons/CrossCircle.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import Setting from '$lib/components/setting/setting.svelte';

  let { data } = $props();
  let { user, kycStatus } = $derived(data);
</script>

<HeadMeta title="Identity & Payments | Settings | Wave" />

<h5>Payments and rewards</h5>

<Setting
  title="Identity Verification"
  subtitle="Verify your identitiy to be able to withdraw earned rewards."
>
  {#if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'GREEN'}
    <div
      class="kyc-status"
      style="color: var(--color-positive-level-6); background-color: var(--color-positive-level-1);"
    >
      <CheckCircle style="fill: var(--color-positive-level-6);" />
      <div class="description">Your identity has been successfully verified.</div>
    </div>
  {:else if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'RED' && !kycStatus.canRetry}
    <div
      class="kyc-status with-action"
      style="color: var(--color-negative-level-6); background-color: var(--color-negative-level-1);"
    >
      <CrossCircle style="fill: var(--color-negative-level-6);" />
      <div class="description">
        Your identity couldn't be verified. Reach out to <a href="/wave/support">support</a> for assistance.
      </div>
    </div>
  {:else if kycStatus.status === 'applicantReviewed' && kycStatus.reviewAnswer === 'RED' && kycStatus.canRetry}
    <div
      class="kyc-status with-action"
      style="color: var(--color-caution-level-6); background-color: var(--color-caution-level-1);"
    >
      <ExclamationCircle style="fill: var(--color-caution-level-6);" />
      <div class="description">
        Please re-submit key documents to complete identity verification.
      </div>
      <Button icon={ArrowRight} href="/wave/kyc" variant="primary">Verify identity</Button>
    </div>
  {:else if !kycStatus.status || kycStatus.status === 'pending' || kycStatus.status === 'applicantReset' || kycStatus.status === 'applicantCreated'}
    <div
      class="kyc-status with-action"
      style="color: var(--color-caution-level-6); background-color: var(--color-caution-level-1);"
    >
      <div class="description">
        <ExclamationCircle style="fill: var(--color-caution-level-6);" />
        Verify your identity now to be eligible for Wave rewards.
      </div>
      <Button icon={ArrowRight} href="/wave/kyc" variant="primary">Verify identity</Button>
    </div>
  {:else if kycStatus.status === 'applicantPending' || kycStatus.status === 'applicantOnHold'}
    <div
      class="kyc-status"
      style="color: var(--color-foreground); background-color: var(--color-foreground-level-1);"
    >
      <div class="description">
        Your provided documents are being reviewed. You will be notified once the review is
        complete.
      </div>
    </div>
  {/if}
</Setting>

<Divider />
<h5>Profile</h5>

<Setting
  title="Email address"
  subtitle="To change this, update your primary email address on GitHub, then log out and back into Drips Wave."
>
  <span class="typo-text">{user.email}</span>
</Setting>

<style>
  .kyc-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--color-foreground-level-1);
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
  }

  .kyc-status.with-action {
    padding: 0.5rem 0.5rem 0.5rem 1rem;
  }

  .kyc-status .description {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
  }
</style>
